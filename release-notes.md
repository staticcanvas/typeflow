## TypeFlow 0.34.2

TypeFlow 0.34.2 corrects package typing and release publication metadata from the 0.34.1 release.

### Fixed

- Expose TypeScript declarations for the root, metrics, debug, and caret npm exports under NodeNext module resolution.
- Publish every optional entry point through JSR.
- Enumerate paginated GitLab package API responses and select the requested generic package version exactly.
- Wait for every expected registry artifact before generating GitLab release links.
- Generate SHA-256 metadata from GitLab's `file_sha256` field.
- Keep distribution archives outside the npm and JSR package roots.
- Publish complete release asset metadata for core and optional bundles.
- Use the canonical JSR package URL in generated release descriptions.
- Enforce public access for the documentation Pages deployment.
- Reject release tags whose version differs from `package.json`.

### Changed

- Use the repository's release notes and PowerShell tooling as the release metadata source of truth.
- Set a measured 10.25 KiB gzip budget and require at least 128 bytes of remaining headroom.
