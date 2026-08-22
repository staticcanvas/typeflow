# TypeFlow — Development Statistics & Performance Benchmarks

This document records the performance characteristics, memory consumption, execution benchmarks, and bundle size statistics for `@staticcanvas/typeflow`.

---

## 1. Engine Performance Benchmarks (10,000+ Character Suite)

Benchmarks executed on Node.js runtime with V8 engine utilizing standard `Intl.Segmenter` grapheme and word segmentation engines.

### 1.1 Throughput & Latency Metrics

| Benchmark Scenario | Input Size | Target Granularity | Execution Time | Throughput | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Grapheme Cluster Segmentation** | 12,000 chars | Grapheme (Unicode) | 9.18 ms | 1,307,189 chars/sec | PASS |
| **Word Boundary Segmentation** | 12,000 chars | Word (Intl) | 1.72 ms | 6,976,744 chars/sec | PASS |
| **HTML Tree Parse & Sanitization** | 10,170 chars | Nested DOM Nodes | 14.20 ms | 716,197 chars/sec | PASS |
| **Instant Reset / Erase Execution** | 10,000 chars | ReplaceChildren | 0.85 ms | 11,764,705 chars/sec | PASS |
| **Memory Delta (Heap Allocation)** | 10,125 chars | Grapheme Array | +42.18 KB | N/A | PASS |

### 1.2 Benchmark Evaluation

- **Grapheme Clustering**: Handles multi-byte UTF-16 surrogate pairs, compound emojis (e.g. `👨‍👩‍👧‍👦`), and international accent combinations in under 10ms for payloads exceeding 10,000 characters.
- **HTML Sanitization**: Recursive DOM fragment generation and allowlist filtering operates at >700K characters per second without string concatenation vulnerabilities.
- **Memory Footprint**: Average memory overhead for a 10k character operation is bounded to <50 KB, preventing memory leaks in persistent sequence loops.

---

## 2. Production Distribution & Bundle Size Audit

Size budgets are audited against gzip compression limits for static web distribution.

### 2.1 Artifact Sizes

| Distribution Format | Target Path | Raw Size | Gzip Size | Size Budget | Budget Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UMD Minified** | `dist/typeflow/dist/typeflow.min.js` | 12,555 B | 4,704 B (4.59 KB) | < 5.0 KB | PASS (91.8%) |
| **ESM Minified** | `dist/typeflow/dist/typeflow.esm.min.js` | 12,260 B | 4,613 B (4.50 KB) | < 5.0 KB | PASS (90.1%) |
| **CommonJS** | `dist/typeflow/dist/typeflow.cjs` | 22,560 B | 7,850 B (7.66 KB) | N/A | PASS |
| **ESM Standard** | `dist/typeflow/dist/typeflow.mjs` | 21,810 B | 7,730 B (7.54 KB) | N/A | PASS |

---

## 3. Test Coverage & Engine Verification

| Test Category | Description | Status |
| :--- | :--- | :--- |
| **Plain Text & Grapheme** | Basic reveal, punctuation natural cadence, compound emoji safety | PASS |
| **Scramble & Decrypt** | Multi-round random glyph decoding and scramble decay | PASS |
| **HTML Sanitization** | Deep nested tags, void element balancing (`<br>`, `<hr>`), XSS stripping | PASS |
| **Erase Modes** | Backspace (`end`), left erosion (`start`), opacity cross-fade, instant | PASS |
| **Sequence Controller** | Step orchestration (`type`, `erase`, `pause`, `visible`, `call`), cancellation | PASS |
| **Framework Adapters** | React hooks (`useTypeFlow`), Vue composition wrappers | PASS |

---

## 4. Execution Environment

- **Runtime**: Node.js v25.2.1
- **V8 Version**: 13.x
- **Internationalization Engine**: ICU (Full Unicode 15.0 data)
- **Benchmarking Tool**: `scripts/run-benchmark.mjs`
