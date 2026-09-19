# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased development changes

### Added

- Add stable spatial word-motion reveal/erase styles with reduced-motion behavior, semantic DOM cleanup, declarations, documentation, examples, and browser regression coverage.
- Add the optional schema-v1 Web Audio preset registry with immutable built-ins, validation, compatibility aliases, scoped interruption cleanup, declarations, documentation, and teardown tests.
- Add the explicitly opt-in experimental parallel companion; its API is not yet stable.

### Fixed

- Preserve `<ul>`, `<ol>`, and `<li>` in HTML mode by adding them to the default sanitizer allowlist; they were previously unwrapped, leaving only their text content (#1).

### Migration

- Existing core methods and built-in audio names remain compatible. See the 0.28 migration guide for additive style values and opt-in extension imports.

## [0.34.2]

> 2026-09-08

### Fixed

- Restore NodeNext declaration resolution for the root, metrics, debug, and caret npm exports.
- Publish all eight public entry points through JSR with explicit declaration references.
- Make GitLab package discovery exact, paginated, and stable across scalar and array responses.
- Wait for the complete release manifest before creating links and SHA-256 metadata.
- Keep release archives outside npm and JSR package payloads.
- Use version-matched release notes and the canonical JSR URL.
- Enforce public GitLab Pages access during documentation deployment.

### Changed

- Validate release tag alignment, package exports, archive placement, JSR declarations, and bundle-size headroom before publication.

## [0.34.0]

> 2026-09-07

<!-- rivet:changelog:start -->

### Added

- Add audio presets and experimental parallel orchestration. ([1ca0935](https://gitlab.com/staticcanvas/typeflow/-/commit/1ca09352a2e81da6cab1e90296b3e13a3da6b880) — @sgkens)
- Refine splash demos and page navigation. ([a01b113](https://gitlab.com/staticcanvas/typeflow/-/commit/a01b1132c6f9aa5b8ec4e82815c7673b04684010) — @sgkens)
- Add reveal/erase/caret index with playground deep-linking. ([6504122](https://gitlab.com/staticcanvas/typeflow/-/commit/6504122e5531205fcfa45102700dbf3183f90c6a) — @sgkens)
- Add interactive Caret API as an opt-in extension. ([b79f2ef](https://gitlab.com/staticcanvas/typeflow/-/commit/b79f2ef6061779c4a06882d7b5b3143528ea1d77) — @sgkens)
- Add spatial motion to the playground and fix Mermaid rendering. ([083c72c](https://gitlab.com/staticcanvas/typeflow/-/commit/083c72cf0821a7c446f891350caa1d1972479a1b) — @sgkens)
- Add float-in-* and zoom-in-space word-motion styles. ([2e71943](https://gitlab.com/staticcanvas/typeflow/-/commit/2e71943e94e5f5e19124c3a45848408cef52d0df) — @sgkens)
- Add SEO and LLM discovery. ([8ebb0d1](https://gitlab.com/staticcanvas/typeflow/-/commit/8ebb0d122a622087e742ce9341d5c1a65e3fc59b) — @sgkens)

### Changed

- Update readme corrected badge pointer. ([3b22756](https://gitlab.com/staticcanvas/typeflow/-/commit/3b2275683fe1375156a832a1d63fef81d8ef1557) — @sgkens)
- Added code format. ([7997e14](https://gitlab.com/staticcanvas/typeflow/-/commit/7997e141be88e1c1c22b2107fd73337d56709216) — @sgkens)
- Document caret, word-motion styles, and sequence hooks. ([c2415a8](https://gitlab.com/staticcanvas/typeflow/-/commit/c2415a8cc4331da827152975c6267fb8a640dc77) — @sgkens)
- Restore keystroke and extchars companion extension exports. ([2f9af4c](https://gitlab.com/staticcanvas/typeflow/-/commit/2f9af4cc6048964a60729ee190713c6fe80b73c8) — @sgkens)
- Update readme. ([73d1481](https://gitlab.com/staticcanvas/typeflow/-/commit/73d1481177fecf878c7b7377247bae058d65728c) — @sgkens)
- Update manifest, documenation for v0.34.0. ([0c4f6e8](https://gitlab.com/staticcanvas/typeflow/-/commit/0c4f6e8c8b8b1daf0125f9cb12226535bcae48f2) — @sgkens)
- Document runtime extensions and development migration. ([ed2cd4a](https://gitlab.com/staticcanvas/typeflow/-/commit/ed2cd4a5e47271ab70542bb00a101e2a8807cecf) — @sgkens)
- Update readme, npm readme, changelog, and release notes for initial release. ([5dc397a](https://gitlab.com/staticcanvas/typeflow/-/commit/5dc397a990d6b84c6f54ced14d4ffbf421e79718) — @sgkens)
- Update gitignore removed .rivet config directory. ([4da0c26](https://gitlab.com/staticcanvas/typeflow/-/commit/4da0c26b32dc726ee619844fe296a3648d340d59) — @sgkens)
- Add rivet metadata repository and metadata configuration. ([13a5100](https://gitlab.com/staticcanvas/typeflow/-/commit/13a510099d6411dd70aa82ff0afb9dc2cf77a3fe) — @sgkens)
- Update hugo main layout file, update favicons html template, update changelog template. ([7728978](https://gitlab.com/staticcanvas/typeflow/-/commit/77289782c5d8732142ff25e4de0c7e08ddfffec3) — @sgkens)
- Update changelog.json. ([ddee49c](https://gitlab.com/staticcanvas/typeflow/-/commit/ddee49c32281f4f944a88c64857ba0a0e94db73d) — @sgkens)
- Update favicons following best practice. ([8345437](https://gitlab.com/staticcanvas/typeflow/-/commit/83454371d126bdc9f3bf628c706daa2e4a6e9a65) — @sgkens)
- Remove syntax-highlighting fixture page, rename index sidebar entry. ([dcb6547](https://gitlab.com/staticcanvas/typeflow/-/commit/dcb65478348816bf4e0c83b097a102661085cc2e) — @sgkens)
- Add Playwright suite for docs UI and wire GitLab CI. ([2429a99](https://gitlab.com/staticcanvas/typeflow/-/commit/2429a99c3860dbf65ffe512f7a87199ca67b7c60) — @sgkens)
- Bump to 0.28.0, add release-doc/data-validation scripts. ([2ebc799](https://gitlab.com/staticcanvas/typeflow/-/commit/2ebc7998eecfe10b5d6f09e82be0915706b43335) — @sgkens)
- Fix leftover template branding and document release-doc workflow. ([a901148](https://gitlab.com/staticcanvas/typeflow/-/commit/a901148baba55adb149f8669fc323bc7430c193b) — @sgkens)
- Refresh v0.27.0 browser bundles. ([d6bca59](https://gitlab.com/staticcanvas/typeflow/-/commit/d6bca597ea7d4b957825ba4607ba5beb52463e69) — @sgkens)
- Align test and lint configuration. ([d6e2730](https://gitlab.com/staticcanvas/typeflow/-/commit/d6e273092ea18b4817b14e81452e3c6858bfb0b3) — @sgkens)
- Fix codecov invalid project reference. ([cb699a4](https://gitlab.com/staticcanvas/typeflow/-/commit/cb699a4469dc5da1f1d6aa6f667a8f105d1b922f) — @sgkens)
- Fix ci 'invalid: workflow:rules:rule when unknown value: on_success'. ([cfb1209](https://gitlab.com/staticcanvas/typeflow/-/commit/cfb12096ad1b9bc7d9c69ce968fd0d7710ce3de7) — @sgkens)
- Update versioning meta to v0.27.0. ([7ad4953](https://gitlab.com/staticcanvas/typeflow/-/commit/7ad49536df3de8a9232ea594e8a2f2b554b77168) — @sgkens)
- Update. ([62f0d07](https://gitlab.com/staticcanvas/typeflow/-/commit/62f0d07c6c807b2ed6cf2386e26137630cb105c4) — @sgkens)
- Update readme-npm and readme.md. ([779fa66](https://gitlab.com/staticcanvas/typeflow/-/commit/779fa66f9b254eb365a9a1c7a2fe30d4027e6cbb) — @sgkens)
- Ignore .rivet tool state, drop stale hawk entries. ([1a71973](https://gitlab.com/staticcanvas/typeflow/-/commit/1a71973c9155b67ba327fb653c672ef4a34eff1d) — @sgkens)
- Remove root-level rivet automation files. ([92ec42d](https://gitlab.com/staticcanvas/typeflow/-/commit/92ec42dc8a8cbb67eae16e442956488bab11acd7) — @sgkens)
- Add brand licensing notes and playground library assets. ([b98175c](https://gitlab.com/staticcanvas/typeflow/-/commit/b98175ce5b607a350a6f6498dc2f09be8c4033ba) — @sgkens)
- Fix tag workflow rule and codecov/release-notes naming. ([e3ef214](https://gitlab.com/staticcanvas/typeflow/-/commit/e3ef21422f0aecfe04800f8472e27355d8225f74) — @sgkens)
- Restructure package exports and tooling. ([285fe7f](https://gitlab.com/staticcanvas/typeflow/-/commit/285fe7fa2398a0f23f30f06685b5e103e23bb215) — @sgkens)
- Add hawk playground and scope Pagefind indexing. ([04818bb](https://gitlab.com/staticcanvas/typeflow/-/commit/04818bbc7aa1ffa72bc6b8433552a5b2af04265f) — @sgkens)
- Gitignore nested hawk checkout and its dev-loop output. ([0d15de3](https://gitlab.com/staticcanvas/typeflow/-/commit/0d15de3459fe735f4807df36ada6626bee0c96ab) — @sgkens)
- Remove glmeta old automation module. ([dad8a4d](https://gitlab.com/staticcanvas/typeflow/-/commit/dad8a4d2da3a8d10b224c3263b6d13f0b437ba96) — @sgkens)
- Add playground tooltips and update docs, CI, and repo metadata tools. ([07cedb6](https://gitlab.com/staticcanvas/typeflow/-/commit/07cedb6c0d3dbb48329de85da3ba68e3e38eb669) — @sgkens)

### Fixed

- Prevent release metadata JSON from collapsing to an object. ([ebabdf1](https://gitlab.com/staticcanvas/typeflow/-/commit/ebabdf15976f615abea8de7a255b581e9006c847) — @sgkens)
- Wrap splash version and stabilize animation lifecycle tests. ([64326da](https://gitlab.com/staticcanvas/typeflow/-/commit/64326da8c7929defb715827f2b6cfaeb46ab1fe2) — @sgkens)
- Support CI Hugo menus and narrow-screen controls. ([741134f](https://gitlab.com/staticcanvas/typeflow/-/commit/741134f87ae83a6426e4fcb1c2605dd3fb19338a) — @sgkens)
- Align playground controls and generated examples. ([285d02c](https://gitlab.com/staticcanvas/typeflow/-/commit/285d02c3c779adf2b347fc24e08d19b40f3449ed) — @sgkens)
- Prefix root-relative markdown links with the site's baseURL. ([7086e3f](https://gitlab.com/staticcanvas/typeflow/-/commit/7086e3f5081f8082bb7e2ae5675b6509babd5ccd) — @sgkens)
- Add missing guide pages to the sidebar navigation menu. ([c49f7eb](https://gitlab.com/staticcanvas/typeflow/-/commit/c49f7ebeb9a6ed1f5c7a40e9269e493b35c9fa78) — @sgkens)
- Slow down word-motion splash slogans to a perceptible pace. ([b7beee5](https://gitlab.com/staticcanvas/typeflow/-/commit/b7beee59c37f3079c8ffe14c1e75de4f3969fc60) — @sgkens)
- Align splash slogans with their animation type and fix schema drift. ([0d193b4](https://gitlab.com/staticcanvas/typeflow/-/commit/0d193b4c4b76f756c39ed6834d3e52e5b98c444e) — @sgkens)

<!-- rivet:changelog:end -->

## [v0.36.7]

### Added

- Add SEO and LLM discovery. ([8ebb0d1](https://gitlab.com/staticcanvas/typeflow/-/commit/8ebb0d122a622087e742ce9341d5c1a65e3fc59b) — @sgkens)

### Changed

- Refresh v0.27.0 browser bundles. ([d6bca59](https://gitlab.com/staticcanvas/typeflow/-/commit/d6bca597ea7d4b957825ba4607ba5beb52463e69) — @sgkens)
- Align test and lint configuration. ([d6e2730](https://gitlab.com/staticcanvas/typeflow/-/commit/d6e273092ea18b4817b14e81452e3c6858bfb0b3) — @sgkens)
- Fix codecov invalid project reference. ([cb699a4](https://gitlab.com/staticcanvas/typeflow/-/commit/cb699a4469dc5da1f1d6aa6f667a8f105d1b922f) — @sgkens)
- Fix ci 'invalid: workflow:rules:rule when unknown value: on_success'. ([cfb1209](https://gitlab.com/staticcanvas/typeflow/-/commit/cfb12096ad1b9bc7d9c69ce968fd0d7710ce3de7) — @sgkens)
- Update versioning meta to v0.27.0. ([7ad4953](https://gitlab.com/staticcanvas/typeflow/-/commit/7ad49536df3de8a9232ea594e8a2f2b554b77168) — @sgkens)
- Update. ([62f0d07](https://gitlab.com/staticcanvas/typeflow/-/commit/62f0d07c6c807b2ed6cf2386e26137630cb105c4) — @sgkens)
- Update readme-npm and readme.md. ([779fa66](https://gitlab.com/staticcanvas/typeflow/-/commit/779fa66f9b254eb365a9a1c7a2fe30d4027e6cbb) — @sgkens)
- Ignore .rivet tool state, drop stale hawk entries. ([1a71973](https://gitlab.com/staticcanvas/typeflow/-/commit/1a71973c9155b67ba327fb653c672ef4a34eff1d) — @sgkens)
- Remove root-level rivet automation files. ([92ec42d](https://gitlab.com/staticcanvas/typeflow/-/commit/92ec42dc8a8cbb67eae16e442956488bab11acd7) — @sgkens)
- Add brand licensing notes and playground library assets. ([b98175c](https://gitlab.com/staticcanvas/typeflow/-/commit/b98175ce5b607a350a6f6498dc2f09be8c4033ba) — @sgkens)
- Fix tag workflow rule and codecov/release-notes naming. ([e3ef214](https://gitlab.com/staticcanvas/typeflow/-/commit/e3ef21422f0aecfe04800f8472e27355d8225f74) — @sgkens)
- Restructure package exports and tooling. ([285fe7f](https://gitlab.com/staticcanvas/typeflow/-/commit/285fe7fa2398a0f23f30f06685b5e103e23bb215) — @sgkens)
- Add hawk playground and scope Pagefind indexing. ([04818bb](https://gitlab.com/staticcanvas/typeflow/-/commit/04818bbc7aa1ffa72bc6b8433552a5b2af04265f) — @sgkens)
- Gitignore nested hawk checkout and its dev-loop output. ([0d15de3](https://gitlab.com/staticcanvas/typeflow/-/commit/0d15de3459fe735f4807df36ada6626bee0c96ab) — @sgkens)
- Remove glmeta old automation module. ([dad8a4d](https://gitlab.com/staticcanvas/typeflow/-/commit/dad8a4d2da3a8d10b224c3263b6d13f0b437ba96) — @sgkens)
- Add playground tooltips and update docs, CI, and repo metadata tools. ([07cedb6](https://gitlab.com/staticcanvas/typeflow/-/commit/07cedb6c0d3dbb48329de85da3ba68e3e38eb669) — @sgkens)

## [0.27.0]

> 2026-08-23

- No release-note commits were found in the selected range.

## [0.27.0-snapshot]

> 2026-08-23

### Added

- Update sample cyber phrase to BUILD STATUS RUNNING. ([5fb4bcc](https://gitlab.com/staticcanvas/typeflow/-/commit/5fb4bcc57df73945eb6fc884111040ee712e2c0b) — @sgkens)
- Add site data playground samples with streaming tokens and animated progress bar morphing. ([768fb75](https://gitlab.com/staticcanvas/typeflow/-/commit/768fb753839e0ee916f8d3790bb3eb2a169a70ef) — @sgkens)
- Add site splash slogans data, playground syntax highlighting, clean hero terminal, and core maintainability guidelines. ([89e7747](https://gitlab.com/staticcanvas/typeflow/-/commit/89e77476f114a4e551eb1343a4333dc5814a952d) — @sgkens)
- Center search input with subtle brand orange borders, enhance search markdown preview parser, and clean splash hero. ([c56822a](https://gitlab.com/staticcanvas/typeflow/-/commit/c56822a00ffadbb369995e64ac980a319a0335d6) — @sgkens)
- Add text charts, sparklines & audio soundtrack synchronization guides and playground demos. ([92db9a7](https://gitlab.com/staticcanvas/typeflow/-/commit/92db9a7db98772da3664470bf396a0fc89403357) — @sgkens)
- Complete pending backlog — architecture docs, Alpine/Web Component adapters, responsive 1440px margins, and pastel orange method styling. ([3b021e0](https://gitlab.com/staticcanvas/typeflow/-/commit/3b021e05efff7503555f385c23e6bd366e64c82a) — @sgkens)
- Add rich markdown styling to search preview pane and make splash title lowercase. ([560cd72](https://gitlab.com/staticcanvas/typeflow/-/commit/560cd7233f4a61a287cc490e4e6e36813b66ecf3) — @sgkens)
- Add View Transitions API — slide-in content, fixed header/sidebar, reduced-motion support. ([32a9db4](https://gitlab.com/staticcanvas/typeflow/-/commit/32a9db4569d0824a5a81ff3d07aa44d26497c4b6) — @sgkens)
- Integrate Mermaid.js with themed dark/light token-matched diagram rendering. ([a1b0686](https://gitlab.com/staticcanvas/typeflow/-/commit/a1b0686e85d686756818d30c5ad549bf0f8a5d3b) — @sgkens)
- Update jsDelivr CDN section to provide direct URLs for ESM, UMD, and CJS. ([7f639bd](https://gitlab.com/staticcanvas/typeflow/-/commit/7f639bd0c3d7131e576f118541413f91c1a6fff1) — @sgkens)
- Redesign splash hero, animation matrix grid, zero-fouc styling and 2-column search. ([50d289e](https://gitlab.com/staticcanvas/typeflow/-/commit/50d289e39fc1aee7cfb0c2921cc90a898d090604) — @sgkens)
- Add interactive workbench with metrics HUD and debug switches. ([270bd5e](https://gitlab.com/staticcanvas/typeflow/-/commit/270bd5e02cb25d432a0d212fe7f1db355c5e338f) — @sgkens)
- Implement reveal engines, natural cadence, trailing fade and modular extensions. ([1019e7d](https://gitlab.com/staticcanvas/typeflow/-/commit/1019e7d08cbff77d21295fd0116e0f98b2383962) — @sgkens)
- Add Svelte action and Solid.js adapter with updated documentation. ([b7fd4aa](https://gitlab.com/staticcanvas/typeflow/-/commit/b7fd4aa0aa74f60c4d4343c034b35a795a9032d1) — @sgkens)
- Add Intl.Segmenter, scramble/matrix reveal, word granularity, and seq.visible. ([1d7d184](https://gitlab.com/staticcanvas/typeflow/-/commit/1d7d1848b47e2d740c6bf51575077acfddfe48d3) — @sgkens)
- Add Plume-inspired Hugo documentation site, branding assets, and project configuration. ([fd5ab95](https://gitlab.com/staticcanvas/typeflow/-/commit/fd5ab957dc1bf1eb9808cb3907c18b065174bdae) — @sgkens)
- Add complete TypeScript definitions and test suite. ([b6a0be8](https://gitlab.com/staticcanvas/typeflow/-/commit/b6a0be860c0383e0e2c0cc6848506eabebb7133f) — @sgkens)
- Allow sequence-level default target configuration. ([4e54260](https://gitlab.com/staticcanvas/typeflow/-/commit/4e5426075aad7f34dd28af1b02eec8904237c270) — @sgkens)
- Add multi-directional erase styles (end, start, middle, explode) (v2.2.0). ([7e1b443](https://gitlab.com/staticcanvas/typeflow/-/commit/7e1b44334aa54522ed08c80463d31d12bc55aa02) — @sgkens)
- Add sequence orchestration engine with pause, erase, and custom calls (v2.1.0). ([41c7667](https://gitlab.com/staticcanvas/typeflow/-/commit/41c76672f4d99ac10523d84e153b687049ff92a6) — @sgkens)
- Breaking: Rewrite engine with ESM, sanitizer, reduced motion, and framework adapters (v2.0.0). ([23cc688](https://gitlab.com/staticcanvas/typeflow/-/commit/23cc6881223fcb3c63637d1a1839c3ff6d4fd277) — @sgkens)
- Implement DOM traversal HTML parser for text and element tags. ([2d28f2b](https://gitlab.com/staticcanvas/typeflow/-/commit/2d28f2b28224aa18d8a699e2fabc0309a2ae0356) — @sgkens)
- Add support for rendering HTML tags alongside text stream. ([71ee1c2](https://gitlab.com/staticcanvas/typeflow/-/commit/71ee1c247bc6b430c72717eb117d4e62b419a58f) — @sgkens)
- Add HTML text parts parsing and split plain text character handling. ([f8637f9](https://gitlab.com/staticcanvas/typeflow/-/commit/f8637f9b578e284faa74670593525b8c429eb23c) — @sgkens)
- Add html mode configuration options to interface. ([3c1ca71](https://gitlab.com/staticcanvas/typeflow/-/commit/3c1ca71e13382933b290feb3fd91218e739dc974) — @sgkens)
- Initial typewriter effect implementation (v1.0.0). ([1679977](https://gitlab.com/staticcanvas/typeflow/-/commit/1679977bc587ae9940b4d7c0c13adb82f6cd8236) — @sgkens)

### Changed

- Fix lint configuration and errors. ([038e442](https://gitlab.com/staticcanvas/typeflow/-/commit/038e44286599ad28371b986665964b9bd9c7061a) — @sgkens)
- Update typeflow logo. ([1bfd6b8](https://gitlab.com/staticcanvas/typeflow/-/commit/1bfd6b8d3b866dfcfc568f0773486ef8fa85c2e6) — @sgkens)
- Document framework integrations. ([fa422f5](https://gitlab.com/staticcanvas/typeflow/-/commit/fa422f5e227ddd0022fdd438208b75bab5f79d59) — @sgkens)
- Update docs and package version. ([db67018](https://gitlab.com/staticcanvas/typeflow/-/commit/db67018c04547f0a31fc0e5368368c55a133f6e3) — @sgkens)
- Update runtime and caluculate.ps1 scripts. ([bf9c2d0](https://gitlab.com/staticcanvas/typeflow/-/commit/bf9c2d0657a9444f76df9ebefeab109cd56680a3) — @sgkens)
- Update semver. ([9ccc0f4](https://gitlab.com/staticcanvas/typeflow/-/commit/9ccc0f436563cc8b416565b296bb759c22196956) — @sgkens)
- Update downloads metadata, adjust size budgets, and validate release readiness. ([ab43406](https://gitlab.com/staticcanvas/typeflow/-/commit/ab434066ea708a48014f89ba888d60f7ee8258dc) — @sgkens)
- Update author and license metadata in typeflow logo SVG. ([08127d0](https://gitlab.com/staticcanvas/typeflow/-/commit/08127d0f20dad2b584596a4b2f8e662855d8074c) — @sgkens)
- Update package version to 0.20.0 and adjust logo generation path. ([0528b53](https://gitlab.com/staticcanvas/typeflow/-/commit/0528b53b970ceae28db19ce80a2bff1645cd67d1) — @sgkens)
- Update documentation guides, extensions reference, changelog and readme. ([0cd28b8](https://gitlab.com/staticcanvas/typeflow/-/commit/0cd28b81ea1be92dac6a8a0c9aa85a297fdeb2d2) — @sgkens)
- Update logo, favicons, and branding assets. ([2c78b0a](https://gitlab.com/staticcanvas/typeflow/-/commit/2c78b0a251ad3889013c63538eddcb162e5d705f) — @sgkens)
- Update packaging, bundle staging, benchmarks and build scripts. ([f4a0259](https://gitlab.com/staticcanvas/typeflow/-/commit/f4a0259103369a12e3ab1c216ab23e11b751daa9) — @sgkens)
- Add comprehensive test suites for reveal engines and extensions. ([63b2a0b](https://gitlab.com/staticcanvas/typeflow/-/commit/63b2a0b909eabf703a90d126f70250a6d7cd733e) — @sgkens)
- Pin adm-zip@0.6.0 via overrides to resolve GHSA-xcpc-8h2w-3j85. ([bef71d4](https://gitlab.com/staticcanvas/typeflow/-/commit/bef71d4bec546a51e53bf45216660f0ae3a33c85) — @sgkens)
- Polish sidebar sticky, TOC right-rail, playground UX, and content clarity. ([655fda8](https://gitlab.com/staticcanvas/typeflow/-/commit/655fda8017fd9d8e5bc123c211f9096369944bf6) — @sgkens)
- Add compact README-npm.md for distribution packaging. ([b5e7108](https://gitlab.com/staticcanvas/typeflow/-/commit/b5e71087dd7efcb6724f0eb41b094c982c4649fd) — @sgkens)
- Update README, API specifications, guides, and changelog for v2.3.0. ([ed8d435](https://gitlab.com/staticcanvas/typeflow/-/commit/ed8d435d067e054ad93ee3479c457b54d165b346) — @sgkens)
- Remove staged library artifact now tracked by .gitignore. ([fbbaa13](https://gitlab.com/staticcanvas/typeflow/-/commit/fbbaa13369aa5f43551e5e7cab7b571072424a2e) — @sgkens)
- Expand test suite with void elements, deep nesting, benchmarks, and concurrency. ([0884ddf](https://gitlab.com/staticcanvas/typeflow/-/commit/0884ddfcc1ad8dd035a2396d72b2b9fdcb0130fa) — @sgkens)
- Add examples for plain text and HTML formatting mode. ([cfe9d44](https://gitlab.com/staticcanvas/typeflow/-/commit/cfe9d44f37851ef44dd405e949785e6c7c84b118) — @sgkens)
- Convert TypeFlow to closure module pattern with instance tracking. ([277ee5c](https://gitlab.com/staticcanvas/typeflow/-/commit/277ee5c8c14f5c01e444ca8ba4971b0e01ea9325) — @sgkens)
- Initial commit. ([7c62105](https://gitlab.com/staticcanvas/typeflow/-/commit/7c62105db0df01c405732d3c463df715b2f55683) — Garvey Snow)

### Fixed

- Correct search typewriter to speed:2 (2ms/char delay) — near-instant reveal. ([363ef43](https://gitlab.com/staticcanvas/typeflow/-/commit/363ef433a8d72f97b4b493d37af8dd2ce2ac58cb) — @sgkens)
- Set search typewriter to 500 chars/sec (2ms/char) — near-instant reveal. ([52d678a](https://gitlab.com/staticcanvas/typeflow/-/commit/52d678af2bc0869fe966d38c4b7dce29cde7fa6a) — @sgkens)
- Maximize search typewriter speeds — 120/90 rotate, 160/120 preview title/content. ([ebb8344](https://gitlab.com/staticcanvas/typeflow/-/commit/ebb8344e06807dc9e4abace90389f91df4aeb2f7) — @sgkens)
- Eliminate FOUC via CSS preload+async and opacity guard with 300ms hard deadline. ([234c4b6](https://gitlab.com/staticcanvas/typeflow/-/commit/234c4b6a0fe12dde832ddc03cfbb9a2dfae4d32f) — @sgkens)
- Increase search typewriter speeds for snappier rotation and preview animations. ([b117890](https://gitlab.com/staticcanvas/typeflow/-/commit/b1178906076492f17898ed960fc7d1e6a8aeb60e) — @sgkens)
- Resolve Hugo v0.164 deprecation warnings — hugo.Data and locale keys. ([abde35b](https://gitlab.com/staticcanvas/typeflow/-/commit/abde35bf10805defaa21e08c9754b8ae3a14b43a) — @sgkens)
- Resolve rollup parse error, configure jsdom test env, and pass full test suite. ([4e7fee4](https://gitlab.com/staticcanvas/typeflow/-/commit/4e7fee402e7f18ed8c1c479b92d79182ab03c407) — @sgkens)
- Resolve step target fallback and validate missing targets. ([e659ed8](https://gitlab.com/staticcanvas/typeflow/-/commit/e659ed8bfac2aa4c0a9413a9dd31dd10ca59359f) — @sgkens)
- Add non-breaking space placeholder for blinking cursor width stability. ([8630852](https://gitlab.com/staticcanvas/typeflow/-/commit/86308528bc4d35d186b22b1b495cc913d9a8d8c1) — @sgkens)
