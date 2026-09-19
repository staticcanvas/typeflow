function Request-GenericPackage {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$ProjectId,
        [Parameter(Mandatory = $true)]
        [string]$PackageName,
        [Parameter(Mandatory = $true)]
        [string]$PackageVersion,
        [string]$NameSpace = $env:CI_PROJECT_NAMESPACE,
        [string]$ProjectName = $env:CI_PROJECT_NAME,
        [string]$ApiUrl = $(if ($env:CI_API_V4_URL) { $env:CI_API_V4_URL } else { 'https://gitlab.com/api/v4' }),
        [string]$ApiKey,
        [switch]$Ci
    )

    $ApiUrl = $ApiUrl.TrimEnd('/')
    $headers = @{ 'Content-Type' = 'application/json' }
    if ($ApiKey) {
        $headers[$(if ($Ci) { 'JOB-TOKEN' } else { 'PRIVATE-TOKEN' })] = $ApiKey
    }

    function Invoke-PagedRequest {
        param([Parameter(Mandatory = $true)][string]$Path)

        $results = [System.Collections.Generic.List[object]]::new()
        $page = 1
        do {
            $separator = if ($Path.Contains('?')) { '&' } else { '?' }
            $response = @(Invoke-RestMethod -Uri "$ApiUrl$Path${separator}per_page=100&page=$page" -Method Get -Headers $headers)
            foreach ($item in $response) { $results.Add($item) }
            $page++
        } while ($response.Count -eq 100)

        foreach ($result in $results) { Write-Output $result }
    }

    $encodedName = [uri]::EscapeDataString($PackageName)
    $encodedVersion = [uri]::EscapeDataString($PackageVersion)
    $packagePath = "/projects/$ProjectId/packages?package_name=$encodedName&package_version=$encodedVersion&package_type=generic"

    try {
        $packages = @(Invoke-PagedRequest -Path $packagePath)
        $package = $packages |
            Where-Object { $_.name -eq $PackageName -and $_.version -eq $PackageVersion -and $_.package_type -eq 'generic' } |
            Sort-Object created_at -Descending |
            Select-Object -First 1

        if (-not $package) {
            throw "No generic package found with name '$PackageName' and version '$PackageVersion'."
        }

        $packageFiles = @(Invoke-PagedRequest -Path "/projects/$ProjectId/packages/$($package.id)/package_files")
        foreach ($file in $packageFiles) {
            [pscustomobject][ordered]@{
                package_id   = $file.package_id
                id           = $file.id
                file_name    = $file.file_name
                file_sha256  = $file.file_sha256
                size         = $file.size
                created_at   = $file.created_at
                web_path     = $file.web_path
                download_url = "https://gitlab.com/$NameSpace/$ProjectName/-/package_files/$($file.id)/download"
            }
        }
    } catch {
        throw "Failed to retrieve generic package '$PackageName@$PackageVersion': $($_.Exception.Message)"
    }
}
