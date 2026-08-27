# safety check
if(-not $env:GITLAB_API_KEY) {
    Write-Error 'GITLAB_API_KEY environment variable not set'
    exit 1
}

# invoke GitLab tag synchronization
./tools/glmeta/generate-gitlab-tags.ps1 -Confirm:$false
