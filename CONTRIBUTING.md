# Contributing to TypeFlow

Thank you for contributing to TypeFlow! We welcome pull requests, bug fixes, architecture documentation, and feature proposals.

---

## 1. Core Architecture & Maintainability Principles

To ensure TypeFlow remains lightweight, robust, and maintainable across long-term evolution, all contributions must adhere to the following core practices:

1. **Single Source of Truth (SOT) Architecture**:
   - All styling tokens, color palettes, spacing metrics, and elevation curves must be defined in centralized CSS custom properties (`--tf-*`). Never introduce hardcoded magic numbers or duplicate color constants across stylesheets.

2. **Zero Runtime Dependencies for Core Engine**:
   - The core TypeFlow engine bundle (`dist/typeflow.esm.js`, `dist/typeflow.min.js`) must strictly maintain **zero runtime dependencies** ($0$ NPM dependencies). Specialized subpath modules (such as Web Audio synthesizers or metrics telemetry) must be decoupled as opt-in extensions.

3. **Non-Destructive AST Windowing**:
   - Never slice or mutate HTML strings using regular expressions during the typing/erasing loop. All tree slicing, tag preservation, and character masking must operate over DOM Node trees and AST interval ranges (`revealWindowFragment`) to guarantee zero malformed tags and 100% safe rendering.

4. **Dual-Target Monospace & Web Readability**:
   - Code formatting, component layouts, and documentation must render with equal visual clarity across both standard graphical web browsers and strict monospace terminal/TUI environments.

5. **Zero Cumulative Layout Shift (CLS = 0.00)**:
   - Dynamic typing must never trigger container reflows. Layout containers, typography metrics, and floating cursors must use fixed geometry, tabular numerals, or reservation containers to maintain absolute layout stability.

6. **Strict WCAG 2.2 Accessibility Compliance**:
   - Honor `prefers-reduced-motion` unconditionally across all animation loops. Decorative cursors must always be tagged `aria-hidden="true"`, and live text regions must never spam screen readers during intermediate keystrokes.

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
git clone https://github.com/staticcanvas/typeflow.git
cd typeflow
npm install
```

### Common Commands
```bash
# Run unit test suite
npm test

# Build production bundles (dist/typeflow.esm.js, typeflow.cjs, typeflow.min.js)
npm run build

# Build documentation portal
npm run docs:build

# Run local documentation dev server
npm run docs:dev
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
- `feat(engine): add scramble rounds configuration option`
- `fix(ui): prevent cursor layout shift on mobile viewports`
- `docs(adapters): add Alpine.js and Web Components integration guides`

---

## 5. Pull Request Checklist

Before submitting a pull request, ensure that:
- [ ] All 48 unit tests pass via `npm test`.
- [ ] Production bundles compile cleanly via `npm run build`.
- [ ] Hugo documentation site builds with zero errors via `npm run docs:build`.
- [ ] TypeScript declaration file (`src/typeflow.d.ts`) is updated for any new methods or options.
- [ ] Zero runtime dependencies are introduced to the core package.
- [ ] Commit history follows Conventional Commit standards.
