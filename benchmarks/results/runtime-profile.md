# Runtime path profile

Chromium profile separating segmentation, cloning, DOM replacement, style/layout, paint-frame, timer, and allocation work. The end-to-end AST-window scenario called replaceChildren 160 times.

| Path | Wall time | Heap delta (bytes) |
| :--- | ---: | ---: |
| segmentation-grapheme | 22.80 ms | 0 |
| segmentation-word | 4.40 ms | 0 |
| sanitized-tree-cloning | 0.90 ms | 0 |
| replaceChildren-text | 1.70 ms | 0 |
| style-and-layout | 65.90 ms | 0 |
| paint-frame-settlement | 469.10 ms | 0 |
| timer-dispatch | 2.90 ms | 0 |
| node-allocation | 2.00 ms | 0 |
| typeflow-ast-window-end-to-end | 743.70 ms | 0 |

Environment: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.7922.34 Safari/537.36. Generated 2026-09-05T05:48:03.888Z.
