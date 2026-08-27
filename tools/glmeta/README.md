# Repository Description Tags

This folder contains the metadata used to synchronize GitLab project topics, the project description, and project labels. These are project metadata, not Git tags, refs, releases, or package versions.

## Sources

- [`topics.json`](topics.json) is authoritative for GitLab project topics and label names.
- [`description.json`](description.json) supplies the project description and per-label descriptions.
- [`labels.json`](labels.json) supplies GitLab label colors and visual properties.
- [`gitlab-project-labels.json`](gitlab-project-labels.json) stores non-sensitive project configuration.
- [`generate-gitlab-tags.ps1`](generate-gitlab-tags.ps1) synchronizes project topics, the project description, and project-scoped GitLab labels.

## Usage

```powershell
$env:GITLAB_API_KEY = '<token-from-your-secret-store>'
./tools/glmeta/generate-gitlab-tags.ps1 -AccessToken $env:GITLAB_API_KEY -Confirm:$false
```

Use `-DryRun` to inspect the planned changes. Use `-DeleteMissing` only when labels absent from `topics.json` should be deleted from the GitLab project.
