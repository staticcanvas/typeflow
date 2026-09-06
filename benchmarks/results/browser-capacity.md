# Real-browser capacity benchmark

Capacity is the highest measured tier satisfying every budget. Null metrics are unavailable in that browser and are not inferred.

Budgets: p95 frame time ≤16.7 ms; fewer than two repeated ≥50 ms long tasks; heap growth ≤2,000,000 bytes where measurable; zero leaked controllers/timers.

| Browser | Instances | Wall time | p95 frame | Long tasks | Dropped frames | Heap delta (bytes) | Leaks |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| chromium | 1 | 249.20 ms | 16.80 ms | 0 | 1 | 0 | 0 |
| chromium | 10 | 229.70 ms | 16.80 ms | 0 | 0 | 0 | 0 |
| chromium | 25 | 230.00 ms | 16.80 ms | 0 | 0 | 0 | 0 |
| chromium | 50 | 238.90 ms | 16.70 ms | 0 | 0 | 0 | 0 |
| chromium | 100 | 289.20 ms | 16.70 ms | 0 | 0 | 0 | 0 |
| firefox | 1 | 249.00 ms | 17.24 ms | 0 | 0 | n/a | 0 |
| firefox | 10 | 262.00 ms | 17.28 ms | 0 | 0 | n/a | 0 |
| firefox | 25 | 283.00 ms | 17.22 ms | 0 | 1 | n/a | 0 |
| firefox | 50 | 263.00 ms | 17.22 ms | 0 | 0 | n/a | 0 |
| firefox | 100 | 415.00 ms | 17.22 ms | 0 | 0 | n/a | 0 |

Derived measured capacity:

- chromium: 100 active instances
- firefox: 0 active instances

Environment: linux 6.19.8-surface-3, x64, 12th Gen Intel(R) Core(TM) i5-1235U. Generated 2026-09-04T16:38:40.786Z.
