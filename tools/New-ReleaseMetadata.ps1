[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,
    [Parameter(Mandatory = $true)]
    [string]$PackageName,
    [Parameter(Mandatory = $true)]
    [string]$PackageVersion,
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,
    [Parameter(Mandatory = $true)]
    [string]$Namespace,
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,
    [string]$ApiUrl = $(if ($env:CI_API_V4_URL) { $env:CI_API_V4_URL } else { 'https://gitlab.com/api/v4' }),
    [string]$ApiToken = $(if ($env:CI_JOB_TOKEN) { $env:CI_JOB_TOKEN } else { $env:GITLAB_API_KEY }),
    [string]$OutputDirectory = "dist/$ProjectName",
    [string]$ReleaseNotesPath = 'release-notes.md',
    [ValidateRange(1, 60)]
    [int]$MaximumAttempts = 12,
    [ValidateRange(0, 60)]
    [int]$RetryDelaySeconds = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/Request-GenericPackage.ps1"

$expectedFiles = @(
    Get-Content -LiteralPath $ManifestPath |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ } |
        Sort-Object -Unique
)
if ($expectedFiles.Count -eq 0) {
    throw "Release manifest '$ManifestPath' contains no files."
}

$isCiToken = [bool]$env:CI_JOB_TOKEN -and $ApiToken -eq $env:CI_JOB_TOKEN
$links = @()
for ($attempt = 1; $attempt -le $MaximumAttempts; $attempt++) {
    $links = @(Request-GenericPackage `
        -ProjectId $ProjectId `
        -PackageName $PackageName `
        -PackageVersion $PackageVersion `
        -NameSpace $Namespace `
        -ProjectName $ProjectName `
        -ApiUrl $ApiUrl `
        -ApiKey $ApiToken `
        -Ci:$isCiToken)

    $availableNames = @($links | ForEach-Object { $_.file_name })
    $missingFiles = @($expectedFiles | Where-Object { $_ -notin $availableNames })
    if ($missingFiles.Count -eq 0) { break }

    if ($attempt -eq $MaximumAttempts) {
        throw "Generic package indexing did not expose $($missingFiles.Count) expected files: $($missingFiles -join ', ')."
    }
    Write-Host "Generic package indexing attempt $attempt/$MaximumAttempts is missing $($missingFiles.Count) files; retrying."
    if ($RetryDelaySeconds -gt 0) { Start-Sleep -Seconds $RetryDelaySeconds }
}

$releaseLinks = @($expectedFiles | ForEach-Object {
    $fileName = $_
    $matches = @($links | Where-Object { $_.file_name -eq $fileName } | Sort-Object created_at -Descending)
    if ($matches.Count -eq 0) { throw "Expected release file '$fileName' is unavailable." }
    $matches[0]
})

$invalidChecksums = @($releaseLinks | Where-Object { [string]::IsNullOrWhiteSpace([string]$_.file_sha256) })
if ($invalidChecksums.Count -gt 0) {
    throw "Release metadata contains $($invalidChecksums.Count) files without SHA-256 checksums."
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$linksPath = Join-Path $OutputDirectory 'generic-package-links.json'
$checksumsPath = Join-Path $OutputDirectory 'generic-package-checksums.json'

$releaseLinks |
    ConvertTo-Json -Depth 5 -AsArray |
    Out-File -LiteralPath $linksPath -Encoding utf8
$releaseLinks |
    Select-Object file_name, @{ Name = 'checksum'; Expression = { $_.file_sha256 } } |
    ConvertTo-Json -Depth 2 -AsArray |
    Out-File -LiteralPath $checksumsPath -Encoding utf8

if (-not (Test-Path -LiteralPath $ReleaseNotesPath -PathType Leaf)) {
    throw "Release notes source '$ReleaseNotesPath' was not found."
}
Copy-Item -LiteralPath $ReleaseNotesPath -Destination (Join-Path $OutputDirectory 'release-notes.md') -Force

Write-Host "Generated metadata for $($releaseLinks.Count) release files in '$OutputDirectory'."
