### _**Added**_

- Added `tools/glmeta` metadata catalogs for GitLab project labels, project topics, and project descriptions.
- Added `generate-gitlab-tags.ps1` to synchronize project-scoped labels, repository topics, and the project description through the GitLab API.
- Added non-sensitive GitLab project configuration with project path/ID selection and environment-based token configuration.
- Added dry-run, confirmation, and optional missing-label deletion controls for metadata synchronization.

### _**Changed**_

- Split the former combined tag catalog into `labels.json`, `topics.json`, and `description.json` so each GitLab metadata surface has a dedicated source of truth.
- Made `topics.json` authoritative for GitLab project topics and synchronized label names.
- Made `description.json` authoritative for the project description and per-label descriptions.
- Consolidated GitLab metadata files and scripts under `tools/glmeta`.

### _**Fixed**_

- Fixed PowerShell JSON serialization by selecting the explicit .NET serializer overload for hashtable request bodies.
- Fixed GitLab label update requests to retain the required `name` identifier.
- Corrected terminology and API behavior so repository tags are synchronized as GitLab project topics rather than Git tags.

### _**Validation**_

- PowerShell parser validation passes for the GitLab metadata generator.
- All GitLab metadata JSON files parse successfully.
- The labels, topics, and description catalogs contain the same 29 metadata names.
- `git diff --check` passes.
- 35 Vitest tests pass.
- Source coverage is 93.05% statements and 73.89% branches.
- Minified bundle size is 14,013 bytes (4,190 bytes gzip).
- ESLint, Hugo docs build, bundle-size validation, and live `docs:serve` runtime verification pass.
