<#
.SYNOPSIS
  Synchronizes TypeFlow release notes and Hugo changelog data with Rivet.
.DESCRIPTION
  Uses CHANGELOG.md as the canonical record and asks Rivet to generate
  release-notes.md plus docs/data/changelog.json. Preview mode is the default.
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$Rebuild,
    [string]$FromTag,
    [string]$ReleaseVersion
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$rivetRunner = Join-Path $repositoryRoot 'rivet/run.ps1'
$rivetConfig = Join-Path $repositoryRoot '.rivet/repo_config.json'

if (-not (Test-Path -LiteralPath $rivetRunner -PathType Leaf)) {
    throw 'Rivet is unavailable. Install or link it at ./rivet before generating release documentation.'
}
if (-not (Test-Path -LiteralPath $rivetConfig -PathType Leaf)) {
    throw 'TypeFlow Rivet configuration is missing at ./.rivet/repo_config.json.'
}

$rivetParameters = @{
    RepositoryRoot = $repositoryRoot
    ConfigPath = $rivetConfig
    UpdateChangelogJson = $true
    DryRun = -not $Apply
}
if ($Rebuild) { $rivetParameters.Command = 'rebuild-changelog' }
else { $rivetParameters.UpdateReleaseDocs = $true }
if (-not $Rebuild -and -not $FromTag) {
    $FromTag = @(& git -C $repositoryRoot tag --merged HEAD --sort=-version:refname) |
        Where-Object { $_ -match '^v?\d+\.\d+\.\d+$' } |
        Select-Object -First 1
    if (-not $FromTag) {
        throw 'No stable reachable Git tag was found. Pass -FromTag explicitly or use -Rebuild.'
    }
}
if ($FromTag) { $rivetParameters.FromTag = $FromTag }
if ($ReleaseVersion) { $rivetParameters.ReleaseVersion = $ReleaseVersion }

& $rivetRunner @rivetParameters
if ($LASTEXITCODE) { exit $LASTEXITCODE }
