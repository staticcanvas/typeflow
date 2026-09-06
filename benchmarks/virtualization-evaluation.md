# Large-payload virtualization evaluation

The browser and component profiles show that repeated AST-window reconstruction
is the dominant controllable cost for large rich-HTML payloads. TypeFlow now
uses one persistent text node for ordinary left-to-right plain-text reveal, so
virtualizing that common path would add selection and accessibility complexity
without removing its principal DOM cost.

Rich-HTML virtualization is not enabled. Removing offscreen or unrevealed DOM
would make browser selection, copy, live-region output, link semantics, and the
final sanitized tree depend on viewport position. Chunked rich-HTML commits
also change the current direction, center-reveal, and interruption contracts.

The safe future design is an explicit opt-in chunked strategy which:

- retains a canonical sanitized source tree outside the live target;
- commits only at complete text-node/tag boundaries;
- materializes the complete final tree before resolving;
- switches to immediate completion for copy/selection and assistive-technology
  requests; and
- verifies interruption, bidirectional text, nested links, and final HTML byte
  equivalence before promotion.

Until that strategy has browser evidence, the stable implementation keeps full
content fidelity and uses the incremental plain-text path. No capacity claim in
this repository assumes virtualization.
