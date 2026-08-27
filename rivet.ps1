<#
.SYNOPSIS
    Bootstraps and runs the repository-local Rivet checkout.
.DESCRIPTION
    Clones Rivet into the consuming repository when absent, validates the
    checkout and runner, then forwards all arguments with the consuming
    repository root explicitly selected.
.NOTES
    Set RIVET_REPOSITORY_URL to override the clone source. The legacy
    GLMETA_REPOSITORY_URL variable remains supported during migration.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rivetRoot = [System.IO.Path]::Combine($repositoryRoot, 'rivet')
$runnerPath = [System.IO.Path]::Combine($rivetRoot, 'run.ps1')
$repositoryUrl = [System.Environment]::GetEnvironmentVariable('RIVET_REPOSITORY_URL')
$repositoryUrlWasConfigured = -not [string]::IsNullOrWhiteSpace($repositoryUrl)
if ([string]::IsNullOrWhiteSpace($repositoryUrl)) {
    $repositoryUrl = [System.Environment]::GetEnvironmentVariable('GLMETA_REPOSITORY_URL')
    $repositoryUrlWasConfigured = -not [string]::IsNullOrWhiteSpace($repositoryUrl)
}
if ([string]::IsNullOrWhiteSpace($repositoryUrl)) {
    $repositoryUrl = 'https://gitlab.com/staticcanvas/rivet.git'
}

if (-not [System.IO.Directory]::Exists($rivetRoot)) {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is required to install Rivet.' }
    [Console]::WriteLine("Installing Rivet from $repositoryUrl")
    $cloneOutput = @(& git clone --depth 1 -- $repositoryUrl $rivetRoot 2>&1)
    if ($LASTEXITCODE -ne 0 -and -not $repositoryUrlWasConfigured) {
        # During the GitLab path migration, the legacy project URL remains a
        # read-only installation fallback. The checkout directory is still rivet.
        $repositoryUrl = 'https://gitlab.com/staticcanvas/glmeta.git'
        [Console]::WriteLine("Rivet path unavailable; trying migration source $repositoryUrl")
        $cloneOutput = @(& git clone --depth 1 -- $repositoryUrl $rivetRoot 2>&1)
    }
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone Rivet from '$repositoryUrl'. $($cloneOutput -join ' ')" }
}

$gitDirectory = [System.IO.Path]::Combine($rivetRoot, '.git')
if (-not [System.IO.Directory]::Exists($gitDirectory)) { throw "The Rivet directory exists but is not a Git checkout: $rivetRoot" }
if (-not [System.IO.File]::Exists($runnerPath)) { throw "The Rivet checkout does not contain run.ps1: $runnerPath" }

& $runnerPath -RepositoryRoot $repositoryRoot @args
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
