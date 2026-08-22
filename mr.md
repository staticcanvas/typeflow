# Merge Request: Promote `develop` to `main`

## Summary

Promote the current `develop` branch to `main`, including the TypeFlow core engine, modular extensions, framework integrations, documentation site, playground, release tooling, and supporting tests.

## Highlights

- Added and expanded the zero-dependency TypeFlow animation engine.
- Added grapheme/word segmentation, HTML sanitization, directional reveals and erasing, morphing, streaming, sequences, presets, reduced-motion support, and CLS prevention.
- Added modular metrics, debug, Web Audio, keystroke, and extended-character packages.
- Added framework integrations for React, Vue 3, Svelte, Solid.js, and Alpine.js.
- Added native `<type-flow>` Web Component support.
- Documented Astro client-side integration and Angular directive usage.
- Added complete TypeScript declarations and framework adapter tests.
- Added the Hugo documentation site, interactive playground, search, theming, accessibility guidance, and framework documentation.
- Added build, bundle-size, benchmark, release-validation, and package distribution tooling.
- Updated package metadata to version `0.27.0`.

## Documentation

- Updated `README.md` and `README-npm.md`.
- Synchronized the root changelog and Hugo changelog.
- Added documentation for all shipped adapters and framework integration paths.

## Validation

- Hugo documentation build passes.
- `git diff --check` passes.
- Changelog content is synchronized between `CHANGELOG.md` and `docs/content/changelog.md`.
- JavaScript tests should be run in CI or locally with Node.js/npm available; they were unavailable in the current environment because `npm` was not installed.

## Merge Details

- Source branch: `develop`
- Target branch: `main`
- Merge strategy: Create a merge commit or fast-forward according to repository policy.

## Checklist

- [ ] CI pipeline passes.
- [ ] JavaScript test suite passes.
- [ ] Package/build validation passes.
- [ ] Documentation site preview reviewed.
- [ ] Ready to merge `develop` into `main`.
