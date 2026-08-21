[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,
    [string]$PackageName = $env:CI_PROJECT_NAME,
    [string]$ProjectName = $env:CI_PROJECT_NAME,
    [string]$Namespace = $env:CI_PROJECT_NAMESPACE,
    [string]$ApiUrl = $(if ($env:CI_API_V4_URL) { $env:CI_API_V4_URL } else { 'https://gitlab.com/api/v4' }),
    [Parameter(Mandatory = $true)]
    [string]$ApiToken,
    [string]$OutputPath = 'docs/data/releases.json'
)

$ErrorActionPreference = 'Stop'
$ApiUrl = $ApiUrl.TrimEnd('/')
$projectPath = "$Namespace/$ProjectName"
$publicProjectUrl = "https://gitlab.com/$projectPath"
. "$PSScriptRoot/Request-GenericPackage.ps1"

function Invoke-GitLabPage {
    param([Parameter(Mandatory = $true)][string]$Path)

    $results = @()
    $page = 1
    do {
        $separator = if ($Path.Contains('?')) { '&' } else { '?' }
        $uri = "$ApiUrl$Path${separator}per_page=100&page=$page"
        $pageResults = @(Invoke-RestMethod -Uri $uri -Method Get -Headers @{ 'JOB-TOKEN' = $ApiToken })
        $results += $pageResults
        $page++
    } while ($pageResults.Count -eq 100)

    return $results
}

function Get-AssetKind {
    param([string]$FileName)

    if ($FileName -like '*.tar.gz') { return 'tar.gz' }
    if ($FileName -like '*.zip') { return 'zip' }
    if ($FileName -like '*.map') { return 'source map' }
    if ($FileName -like '*.css') { return 'stylesheet' }
    if ($FileName -like '*.js') { return 'JavaScript' }
    return 'file'
}

Write-Host "Fetching GitLab releases, tags, and generic packages for $projectPath..."
$releases = @(Invoke-GitLabPage -Path "/projects/$ProjectId/releases")
$tags = @(Invoke-GitLabPage -Path "/projects/$ProjectId/repository/tags")
$packages = @(Invoke-GitLabPage -Path "/projects/$ProjectId/packages?package_name=$PackageName&package_type=generic")

$versions = @{}
foreach ($tag in $tags) {
    $version = $tag.name -replace '^v', ''
    $versions[$version] = [ordered]@{
        version = $version
        tag = $tag.name
        released_at = $tag.commit.created_at
        release_url = "$publicProjectUrl/-/releases/$($tag.name)"
        assets = @()
    }
}

foreach ($release in $releases) {
    $version = $release.tag_name -replace '^v', ''
    if (-not $versions.ContainsKey($version)) {
        $versions[$version] = [ordered]@{
            version = $version
            tag = $release.tag_name
            released_at = $release.released_at
            release_url = "$publicProjectUrl/-/releases/$($release.tag_name)"
            assets = @()
        }
    }
    if ($release.released_at) { $versions[$version].released_at = $release.released_at }
    foreach ($link in @($release.assets.links)) {
        $versions[$version].assets += [ordered]@{
            name = $link.name
            kind = 'release asset'
            url = $link.url
            size = $null
            checksum = $null
        }
    }
}

foreach ($package in $packages) {
    $version = [string]$package.version
    $packageFiles = @(Request-GenericPackage -ProjectId $ProjectId -PackageName $PackageName -PackageVersion $version -NameSpace $Namespace -projectName $ProjectName -ApiUrl $ApiUrl -ApiKey $ApiToken -ci)
    if (-not $versions.ContainsKey($version)) {
        $versions[$version] = [ordered]@{
            version = $version
            tag = "v$version"
            released_at = $package.created_at
            release_url = "$publicProjectUrl/-/releases/v$version"
            assets = @()
        }
    }
    foreach ($file in $packageFiles) {
        $versions[$version].assets += [ordered]@{
            name = $file.file_name
            kind = Get-AssetKind -FileName $file.file_name
            url = $file.download_url
            size = $file.size
            checksum = $file.file_sha256
        }
    }
}

$output = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString('o')
    project = $projectPath
    versions = @($versions.Values | Sort-Object { $_.released_at } -Descending | ForEach-Object {
        $_.assets = @($_.assets | Sort-Object name -Unique)
        $_
    })
}

$parent = Split-Path -Parent $OutputPath
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
$output | ConvertTo-Json -Depth 8 | Out-File -FilePath $OutputPath -Encoding utf8
Write-Host "Wrote $($output.versions.Count) release versions to $OutputPath"
