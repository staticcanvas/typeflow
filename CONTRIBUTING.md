# Contributing to TypeFlow

Thank you for contributing to TypeFlow! We welcome pull requests, bug fixes, architecture documentation, and feature proposals.

---

## 1. AI-Assisted Code Policy

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

## 2. Development Workflow

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

## 3. Git & Commit Conventions

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

## 4. Pull Request Checklist

Before submitting a pull request, ensure that:
- [ ] All 44+ unit tests pass via `npm test`.
- [ ] Production bundles compile cleanly via `npm run build`.
- [ ] Hugo documentation site builds with zero errors via `npm run docs:build`.
- [ ] TypeScript declaration file (`src/typeflow.d.ts`) is updated for any new methods or options.
- [ ] Zero runtime dependencies are introduced to the core package.
- [ ] Commit history follows Conventional Commit standards.
