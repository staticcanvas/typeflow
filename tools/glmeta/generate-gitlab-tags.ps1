<#
.SYNOPSIS
    Synchronizes GitLab project topics, description, and labels.

.DESCRIPTION
    Reads tools/glmeta/labels.json, tools/glmeta/topics.json, and
    tools/glmeta/description.json. It synchronizes project topics, the project
    description, and project labels with their descriptions and properties.
    This script does not create Git tags or releases.
    Authentication is read from the configured environment variable, never
    from the non-sensitive JSON configuration.

.PARAMETER ConfigPath
    Path to tools/glmeta/gitlab-project-labels.json.

.PARAMETER AccessToken
    Optional GitLab token. Prefer the configured environment variable.

.PARAMETER DryRun
    Reports create/update/delete operations without changing GitLab.

.PARAMETER DeleteMissing
    Deletes project labels absent from the source catalog. Disabled by default.

.EXAMPLE
    ./generate-gitlab-tags.ps1 -DryRun

.EXAMPLE
    $env:GITLAB_TOKEN = 'token-from-secure-secret-store'
    ./generate-gitlab-tags.ps1
#>

[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [ValidateNotNullOrEmpty()]
    [string]$ConfigPath = [System.IO.Path]::Combine($PSScriptRoot, 'gitlab-project-labels.json'),

    [string]$AccessToken,

    [switch]$DryRun,

    [switch]$DeleteMissing
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-JsonFile {
    param([Parameter(Mandatory)][ValidateScript({ [System.IO.File]::Exists($_) })][string]$Path)

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $document = [System.Text.Json.JsonDocument]::Parse([System.IO.File]::ReadAllText($fullPath))
    try {
        return $document.RootElement.Clone()
    } finally {
        $document.Dispose()
    }
}

function Get-JsonProperty {
    param(
        [Parameter(Mandatory)][System.Text.Json.JsonElement]$Object,
        [Parameter(Mandatory)][string]$Name
    )

    $property = [System.Text.Json.JsonElement]::new()
    if ($Object.ValueKind -eq [System.Text.Json.JsonValueKind]::Object -and $Object.TryGetProperty($Name, [ref]$property)) {
        return $property
    }

    return $null
}

function Get-JsonString {
    param(
        [Parameter(Mandatory)][System.Text.Json.JsonElement]$Object,
        [Parameter(Mandatory)][string]$Name,
        [string]$Default = ''
    )

    $property = Get-JsonProperty -Object $Object -Name $Name
    if ($null -ne $property -and $property.ValueKind -eq [System.Text.Json.JsonValueKind]::String) {
        return $property.GetString()
    }

    return $Default
}

function Resolve-PathFrom {
    param([Parameter(Mandatory)][string]$BasePath, [Parameter(Mandatory)][string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) { return [System.IO.Path]::GetFullPath($Path) }
    return [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($BasePath, $Path))
}

function Get-AccessToken {
    param([Parameter(Mandatory)][System.Text.Json.JsonElement]$GitLab, [string]$ExplicitToken)

    if (-not [string]::IsNullOrWhiteSpace($ExplicitToken)) { return $ExplicitToken }
    $variableName = Get-JsonString -Object $GitLab -Name 'tokenEnvironmentVariable' -Default 'GITLAB_TOKEN'
    $token = [System.Environment]::GetEnvironmentVariable($variableName)
    if ([string]::IsNullOrWhiteSpace($token)) {
        throw "GitLab token not found. Set '$variableName' or pass -AccessToken."
    }
    return $token
}

function Invoke-GitLabRequest {
    param(
        [Parameter(Mandatory)][ValidateSet('GET', 'POST', 'PUT', 'DELETE')][string]$Method,
        [Parameter(Mandatory)][string]$Uri,
        [Parameter(Mandatory)][hashtable]$Headers,
        [hashtable]$Body
    )

    $request = @{
        Method     = $Method
        Uri        = $Uri
        Headers    = $Headers
        TimeoutSec = $script:TimeoutSeconds
    }
    if ($null -ne $Body) {
        $request.ContentType = 'application/json'
        $jsonOptions = [System.Text.Json.JsonSerializerOptions]::new()
        $request.Body = [System.Text.Json.JsonSerializer]::Serialize(
            [object]$Body,
            $Body.GetType(),
            $jsonOptions
        )
    }
    return Invoke-RestMethod @request
}

function Get-ProjectLabels {
    param([Parameter(Mandatory)][string]$ApiRoot, [Parameter(Mandatory)][string]$ProjectKey, [Parameter(Mandatory)][hashtable]$Headers)

    $labels = [System.Collections.Generic.List[object]]::new()
    $page = 1
    do {
        $responseHeaders = $null
        $uri = "$ApiRoot/projects/$ProjectKey/labels?per_page=100&page=$page"
        $pageItems = Invoke-RestMethod -Method Get -Uri $uri -Headers $Headers -TimeoutSec $script:TimeoutSeconds -ResponseHeadersVariable responseHeaders
        foreach ($item in @($pageItems)) { [void]$labels.Add($item) }
        $nextPage = if ($null -ne $responseHeaders -and $responseHeaders.ContainsKey('X-Next-Page')) { $responseHeaders['X-Next-Page'] } else { '' }
        $page = if ([string]::IsNullOrWhiteSpace($nextPage)) { 0 } else { [int]$nextPage }
    } while ($page -gt 0)
    return $labels
}

function New-LabelBody {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Description,
        [string]$Color = '#808080',
        [string]$TextColor = '#FFFFFF'
    )

    return @{
        name        = $Name
        description = $Description
        color       = $Color
        text_color  = $TextColor
    }
}

$configFullPath = [System.IO.Path]::GetFullPath($ConfigPath)
$config = Read-JsonFile -Path $configFullPath
$configDirectory = [System.IO.Path]::GetDirectoryName($configFullPath)
$gitlab = Get-JsonProperty -Object $config -Name 'gitlab'
$labelsSource = Resolve-PathFrom -BasePath $configDirectory -Path (Get-JsonString -Object $config -Name 'labelsSource' -Default 'labels.json')
$topicsSource = Resolve-PathFrom -BasePath $configDirectory -Path (Get-JsonString -Object $config -Name 'topicsSource' -Default 'topics.json')
$descriptionSource = Resolve-PathFrom -BasePath $configDirectory -Path (Get-JsonString -Object $config -Name 'descriptionSource' -Default 'description.json')
$labelsCatalog = Read-JsonFile -Path $labelsSource
$topicsCatalog = Read-JsonFile -Path $topicsSource
$descriptionCatalog = Read-JsonFile -Path $descriptionSource
$labels = Get-JsonProperty -Object $labelsCatalog -Name 'labels'
$topics = Get-JsonProperty -Object $topicsCatalog -Name 'topics'
$labelDescriptions = Get-JsonProperty -Object $descriptionCatalog -Name 'labelDescriptions'
$labelScope = Get-JsonString -Object $config -Name 'labelScope' -Default 'project'
if ($labelScope -ne 'project') { throw "Only project-scoped labels are supported; configured scope was '$labelScope'." }
$labelsScope = Get-JsonString -Object $labelsCatalog -Name 'scope' -Default 'project'
$topicsScope = Get-JsonString -Object $topicsCatalog -Name 'scope' -Default 'project'
$descriptionScope = Get-JsonString -Object $descriptionCatalog -Name 'scope' -Default 'project'
if ($labelsScope -ne 'project') { throw "The labels catalog must declare scope 'project'; configured scope was '$labelsScope'." }
if ($topicsScope -ne 'project') { throw "The topics catalog must declare scope 'project'; configured scope was '$topicsScope'." }
if ($descriptionScope -ne 'project') { throw "The description catalog must declare scope 'project'; configured scope was '$descriptionScope'." }
$baseUri = (Get-JsonString -Object $gitlab -Name 'baseUri' -Default 'https://gitlab.com').TrimEnd('/')
$projectId = Get-JsonString -Object $gitlab -Name 'projectId'
$projectPath = Get-JsonString -Object $gitlab -Name 'projectPath'
if ([string]::IsNullOrWhiteSpace($projectId) -and [string]::IsNullOrWhiteSpace($projectPath)) {
    throw 'Configure gitlab.projectId or gitlab.projectPath before running the generator.'
}
$projectKey = if ([string]::IsNullOrWhiteSpace($projectId)) { [Uri]::EscapeDataString($projectPath) } else { $projectId }
$script:TimeoutSeconds = [int](Get-JsonString -Object $config -Name 'requestTimeoutSeconds' -Default '30')
$defaultTextColor = Get-JsonString -Object $config -Name 'defaultTextColor' -Default '#FFFFFF'
$headers = @{ 'PRIVATE-TOKEN' = (Get-AccessToken -GitLab $gitlab -ExplicitToken $AccessToken); Accept = 'application/json' }
$apiRoot = "$baseUri/api/v4"
$project = Invoke-GitLabRequest -Method Get -Uri "$apiRoot/projects/$projectKey" -Headers $headers
$desiredTopics = [System.Collections.Generic.List[string]]::new()
foreach ($topic in $topics.EnumerateArray()) {
    $topicName = if ($topic.ValueKind -eq [System.Text.Json.JsonValueKind]::String) { $topic.GetString() } else { '' }
    if ([string]::IsNullOrWhiteSpace($topicName)) { throw 'Every topic must be a non-empty string.' }
    if (-not $desiredTopics.Contains($topicName)) { [void]$desiredTopics.Add($topicName) }
}
$currentTopics = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($topic in @($project.topics)) { [void]$currentTopics.Add([string]$topic) }
$topicsChanged = $currentTopics.Count -ne $desiredTopics.Count
if (-not $topicsChanged) {
    foreach ($topicName in $desiredTopics) {
        if (-not $currentTopics.Contains($topicName)) { $topicsChanged = $true; break }
    }
}
$projectUpdate = @{}
if ($topicsChanged) { $projectUpdate.topics = $desiredTopics.ToArray() }
$projectDescription = Get-JsonString -Object $descriptionCatalog -Name 'projectDescription'
if (-not [string]::IsNullOrWhiteSpace($projectDescription) -and [string]$project.description -ne $projectDescription) {
    $projectUpdate.description = $projectDescription
}
if ($projectUpdate.Count -gt 0) {
    $projectAction = 'Synchronize project topics and description'
    if ($DryRun) {
        if ($topicsChanged) { Write-Output "DRY-RUN: Synchronize $($desiredTopics.Count) project topics" }
        if ($projectUpdate.ContainsKey('description')) { Write-Output 'DRY-RUN: Update project description' }
    } elseif ($PSCmdlet.ShouldProcess("GitLab project $projectPath", $projectAction)) {
        [void](Invoke-GitLabRequest -Method Put -Uri "$apiRoot/projects/$projectKey" -Headers $headers -Body $projectUpdate)
        if ($topicsChanged) { Write-Output "Synchronized $($desiredTopics.Count) project topics" }
        if ($projectUpdate.ContainsKey('description')) { Write-Output 'Updated project description' }
    }
}
$existing = Get-ProjectLabels -ApiRoot $apiRoot -ProjectKey $projectKey -Headers $headers
$existingByName = @{}
foreach ($label in $existing) { $existingByName[[string]$label.name] = $label }
$labelPropertiesByName = @{}
foreach ($label in $labels.EnumerateArray()) {
    $labelName = Get-JsonString -Object $label -Name 'name'
    if ([string]::IsNullOrWhiteSpace($labelName)) { throw 'Every label property entry must have a non-empty name.' }
    $labelPropertiesByName[$labelName] = $label
}
$descriptionsByName = @{}
foreach ($descriptionEntry in $labelDescriptions.EnumerateArray()) {
    $descriptionName = Get-JsonString -Object $descriptionEntry -Name 'name'
    if ([string]::IsNullOrWhiteSpace($descriptionName)) { throw 'Every label description must have a non-empty name.' }
    $descriptionsByName[$descriptionName] = Get-JsonString -Object $descriptionEntry -Name 'description'
}
$sourceNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

foreach ($name in $desiredTopics) {
    $description = if ($descriptionsByName.ContainsKey($name)) { [string]$descriptionsByName[$name] } else { '' }
    $labelProperties = $labelPropertiesByName[$name]
    $color = if ($null -ne $labelProperties) { Get-JsonString -Object $labelProperties -Name 'color' -Default '#808080' } else { '#808080' }
    $textColor = if ($null -ne $labelProperties) { Get-JsonString -Object $labelProperties -Name 'textColor' -Default $defaultTextColor } else { $defaultTextColor }
    $body = New-LabelBody -Name $name -Description $description -Color $color -TextColor $textColor
    [void]$sourceNames.Add($name)
    $uri = "$apiRoot/projects/$projectKey/labels"

    if ($existingByName.ContainsKey($name)) {
        # GitLab requires name or label_id to identify the label on update.
        # The catalog currently preserves names, so use the stable name key.
        $action = "Update project label '$name'"
        if ($DryRun) { Write-Output "DRY-RUN: $action"; continue }
        if ($PSCmdlet.ShouldProcess("GitLab project $projectPath", $action)) {
            [void](Invoke-GitLabRequest -Method Put -Uri $uri -Headers $headers -Body $body)
            Write-Output "Updated: $name"
        }
    } else {
        $action = "Create project label '$name'"
        if ($DryRun) { Write-Output "DRY-RUN: $action"; continue }
        if ($PSCmdlet.ShouldProcess("GitLab project $projectPath", $action)) {
            [void](Invoke-GitLabRequest -Method Post -Uri $uri -Headers $headers -Body $body)
            Write-Output "Created: $name"
        }
    }
}

if ($DeleteMissing) {
    foreach ($label in $existing) {
        if (-not $sourceNames.Contains([string]$label.name)) {
            $encodedName = [Uri]::EscapeDataString([string]$label.name)
            $uri = "$apiRoot/projects/$projectKey/labels/$encodedName"
            $action = "Delete project label '$($label.name)'"
            if ($DryRun) { Write-Output "DRY-RUN: $action"; continue }
            if ($PSCmdlet.ShouldProcess("GitLab project $projectPath", $action)) {
                [void](Invoke-GitLabRequest -Method Delete -Uri $uri -Headers $headers)
                Write-Output "Deleted: $($label.name)"
            }
        }
    }
}
