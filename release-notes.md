## Development preview (unreleased)

- Experimental: add opt-in `TypeFlow.parallel()` and `seq.parallel()` prototypes with bounded concurrency, nested groups, ordered settled results, and controller cancellation propagation. This is not a stable API.

<!-- rivet:release-notes:start -->

Generated from `038e4428..HEAD` for TypeFlow `0.34.0`.

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

<!-- rivet:release-notes:end -->
