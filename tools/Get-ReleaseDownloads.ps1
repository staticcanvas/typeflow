[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,
    [string]$PackageName = $env:CI_PROJECT_NAME,
    [string]$ProjectName = $env:CI_PROJECT_NAME,
    [string]$Namespace = $env:CI_PROJECT_NAMESPACE,
    [string]$ApiUrl = $(if ($env:CI_API_V4_URL) { $env:CI_API_V4_URL } else { 'https://gitlab.com/api/v4' }),
    [string]$ApiToken = $(if ($env:CI_JOB_TOKEN) { $env:CI_JOB_TOKEN } else { $env:GITLAB_API_KEY }),
    [string]$OutputPath = 'docs/data/releases.json'
)

$ErrorActionPreference = 'Stop'
$ApiUrl = $ApiUrl.TrimEnd('/')
$projectPath = "$Namespace/$ProjectName"
$publicProjectUrl = "https://gitlab.com/$projectPath"
$isCiToken = [bool]$env:CI_JOB_TOKEN -and $ApiToken -eq $env:CI_JOB_TOKEN
. "$PSScriptRoot/Request-GenericPackage.ps1"

function Invoke-GitLabPage {
    param([Parameter(Mandatory = $true)][string]$Path)

    $results = [System.Collections.Generic.List[object]]::new()
    $page = 1
    do {
        $separator = if ($Path.Contains('?')) { '&' } else { '?' }
        $uri = "$ApiUrl$Path${separator}per_page=100&page=$page"
        $headers = @{}
        if ($ApiToken) {
            $headers[ $(if ($isCiToken) { 'JOB-TOKEN' } else { 'PRIVATE-TOKEN' }) ] = $ApiToken
        }
        $pageResponse = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
        $pageResultCount = 0
        foreach ($pageResult in $pageResponse) {
            $results.Add($pageResult)
            $pageResultCount++
        }
        $page++
    } while ($pageResultCount -eq 100)

    foreach ($result in $results) {
        Write-Output $result
    }
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

function Get-OptionalPropertyValue {
    param(
        [AllowNull()]
        [object]$InputObject,
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if ($null -eq $InputObject) { return $null }

    $property = $InputObject.PSObject.Properties[$Name]
    if ($null -eq $property) { return $null }

    return $property.Value
}

Write-Host "Fetching GitLab releases and generic packages for $projectPath..."
$releases = @(Invoke-GitLabPage -Path "/projects/$ProjectId/releases")
$packages = @(Invoke-GitLabPage -Path "/projects/$ProjectId/packages?package_name=$PackageName&package_type=generic")

$versions = @{}
foreach ($release in $releases) {
    $tagName = [string](Get-OptionalPropertyValue -InputObject $release -Name 'tag_name')
    $version = ($tagName -replace '^v', '') -replace '-release$', ''
    $releaseDate = Get-OptionalPropertyValue -InputObject $release -Name 'released_at'
    if (-not $releaseDate) {
        $releaseDate = Get-OptionalPropertyValue -InputObject $release -Name 'created_at'
    }
    $versions[$version] = [pscustomobject][ordered]@{
        version = $version
        tag = $tagName
        released_at = $releaseDate
        release_url = "$publicProjectUrl/-/releases/$tagName"
        source_url = "$publicProjectUrl/-/tree/$tagName"
        assets = @()
    }
    $versionRecord = $versions[$version]
    $releaseAssets = Get-OptionalPropertyValue -InputObject $release -Name 'assets'
    $releaseLinks = Get-OptionalPropertyValue -InputObject $releaseAssets -Name 'links'
    foreach ($link in @($releaseLinks)) {
        $versionRecord.assets += [ordered]@{
            name = $link.name
            kind = 'release asset'
            url = $link.url
            source_url = $versionRecord.source_url
            size = $null
            checksum = $null
        }
    }
}

foreach ($package in $packages) {
    $version = [string]$package.version
    if (-not $versions.ContainsKey($version)) { continue }
    $packageFiles = @(Request-GenericPackage -ProjectId $ProjectId -PackageName $PackageName -PackageVersion $version -NameSpace $Namespace -projectName $ProjectName -ApiUrl $ApiUrl -ApiKey $ApiToken -ci:$isCiToken)
    $versionRecord = $versions[$version]
    foreach ($file in $packageFiles) {
        $versionRecord.assets = @($versionRecord.assets | Where-Object { $_.name -ne $file.file_name })
        $versionRecord.assets += [ordered]@{
            name = $file.file_name
            kind = Get-AssetKind -FileName $file.file_name
            url = $file.download_url
            source_url = $versionRecord.source_url
            size = $file.size
            checksum = $file.file_sha256
        }
    }
}

$output = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString('o')
    project = $projectPath
    versions = @($versions.Values | Sort-Object released_at -Descending | ForEach-Object {
        $_.assets = @($_.assets | Sort-Object { [string]$_['name'] } -Unique)
        $_
    })
}

$parent = Split-Path -Parent $OutputPath
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
$output | ConvertTo-Json -Depth 8 | Out-File -FilePath $OutputPath -Encoding utf8
Write-Host "Wrote $($output.versions.Count) GitLab release versions to $OutputPath"
