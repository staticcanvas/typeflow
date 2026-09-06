# Contributing to TypeFlow

Thank you for contributing to TypeFlow! We welcome merge requests, bug fixes, architecture documentation, and feature proposals.

---

## 1. Core Architecture & Maintainability Principles

To ensure TypeFlow remains lightweight, robust, and maintainable across long-term evolution, all contributions must adhere to the following core practices:

1. **Single Source of Truth (SOT) Architecture**:
   - All styling tokens, color palettes, spacing metrics, and elevation curves must be defined in centralized CSS custom properties (`--tf-*`). Never introduce hardcoded magic numbers or duplicate color constants across stylesheets.

2. **Zero Runtime Dependencies for Core Engine**:
   - The core TypeFlow engine bundle (`dist/typeflow.esm.js`, `dist/typeflow.min.js`, `dist/typeflow.cjs`) must strictly maintain **zero runtime dependencies** ($0$ NPM dependencies). Specialized subpath modules (such as metrics telemetry or debugging) must be decoupled as opt-in extensions.

3. **Collision-Safe & Viewport-Bounded Positioning**:
   - All tooltip positioning must calculate safe bounding rects, accommodate custom scrolling containers, and handle boundary clipping without layout thrashing.

4. **Dual-Target Monospace & Web Readability**:
   - Code formatting, component layouts, and documentation must render with equal visual clarity across both standard graphical web browsers and strict monospace terminal/TUI environments.

5. **Zero Cumulative Layout Shift (CLS = 0.00)**:
   - Tooltip show/hide animations must never trigger container reflows. Floating tooltips must use fixed/absolute positioning with computed transform offsets.

6. **Strict WCAG 2.2 Accessibility Compliance**:
   - Honor `prefers-reduced-motion` unconditionally across all animation presets. Ensure dynamic `aria-describedby` / `aria-details` relationships and proper keyboard `Escape` dismissals.

7. **Editorial Factuality & Clean Technical Documentation**:
   - Technical documentation, architecture guides, and API references must maintain absolute factuality, precision, and zero-emoji editorial rigor. Use Unicode geometric symbols (`■`, `◆`, `▶`) when visual hierarchy is required.

---

## 2. AI-Assisted Code Policy

AI-assisted and LLM-generated code is **explicitly welcome** in the TypeFlow codebase under the following strict conditions:

1. **Meticulous Human Planning & Review**: All AI-assisted changes must be thoroughly reviewed line-by-line by the developer before creating a merge request or committing. Do not submit unreviewed raw model outputs.
2. **Comprehensive Test Coverage**: Any new behavior or bug fix must include corresponding unit tests in `tests/` that pass with 100% reliability.
3. **Detailed Merge Request (MR) Descriptions**: MR descriptions must be exhaustive and detail:
   - Exactly what problem is being resolved or what feature is introduced.
   - Architectural design rationale and trade-offs considered.
   - Proof of test and build verification (`npm run build && npm run docs:build && npm test`).
   - Confirmation of zero breaking changes or explicit migration steps.
4. **Adherence to Code Standards**: Code must maintain zero runtime dependencies for the core bundle, follow clean ES module patterns, preserve TypeScript type definitions in `src/typeflow.d.ts`, and satisfy performance and accessibility constraints.

---

## 3. Development Workflow

### Prerequisites
- Node.js 18+
- npm 9+
- Hugo v0.125+ (extended edition for documentation builds)

### Initial Setup
```bash
git clone https://gitlab.com/staticcanvas/typeflow.git
cd typeflow
npm install
```

### Common Commands
```bash
# Start local Vite development server
npm run dev

# Start local server with interactive demo harness
npm run serve:demo

# Build production bundles (core, metrics, and debug modules)
npm run build

# Run unit test suite via Vitest
npm test

# Run unit tests with code coverage
npm run test:coverage

# Validate bundle size against 6 KiB gzip budget
npm run check:size

# Run full quality verification (build + check:size + test)
npm run check:quality

# Lint and format codebase
npm run lint
npm run format

# Run local documentation dev server (fetches release data + serves Hugo)
npm run docs:serve

# Build static documentation portal
npm run docs:build
```

---

## 4. Git & Commit Conventions

TypeFlow strictly enforces **Conventional Commits** on all branches. Ongoing development occurs on the `develop` branch.

### Commit Message Format
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: New user-facing feature or API capability.
- `fix`: Bug fix in engine, adapters, or UI.
- `docs`: Documentation updates, guides, or API references.
- `refactor`: Internal code refactoring with no behavioral changes.
- `test`: Adding or correcting unit tests.
- `chore`: Version bumps, package scripts, or repository maintenance.

### Examples
- `feat(position): add custom boundary container support`
- `fix(collision): flip direction when restricted by viewport top edge`
- `docs(themes): add twenty documented theme presets`

---

## 5. Merge Request Checklist

Before submitting a merge request, ensure that:
- [ ] All unit tests pass via `npm test`.
- [ ] Production bundles compile cleanly via `npm run build`.
- [ ] Hugo documentation site builds with zero errors via `npm run docs:build`.
- [ ] TypeScript declaration file (`src/typeflow.d.ts`) is updated for any new methods or options.
- [ ] Zero runtime dependencies are introduced to the core package.
- [ ] Commit history follows Conventional Commit standards.

---

## 6. Release Documentation

`CHANGELOG.md` is the canonical, hand-authored record of every release. `release-notes.md` and `docs/data/changelog.json` (the data source for the Hugo changelog page) are both **generated** from it by Rivet and are committed to the repository, not built on the fly.

CI never generates or mutates these files: the `pages` job (`npm run docs:build`) only builds Hugo from whatever is already committed. This keeps documentation builds deterministic and means release documentation can drift from `CHANGELOG.md` if the generation step is skipped.

Run the apply step and commit its output as part of release preparation, before opening the release merge request:
```bash
# Preview what would change (default, makes no writes)
npm run release:docs:preview

# Apply and write release-notes.md + docs/data/changelog.json
npm run release:docs

# Full tag-history rebuild instead of an incremental update from the last stable tag
npm run release:docs:rebuild:preview
npm run release:docs:rebuild
```

Commit the resulting changes to `release-notes.md` and `docs/data/changelog.json` together with the `CHANGELOG.md` edit that prompted them.
