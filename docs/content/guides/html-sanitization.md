---
title: HTML & sanitization
description: Type formatted HTML markup safely with allowlist sanitization and balanced tag trees.
eyebrow: Guides
---

## Safe HTML Typing

TypeFlow constructs an internal sanitized DOM source tree and uses a recursive fragment cloner.

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

TypeFlow.type('#notice', 'Deploy to <strong>production</strong> with <span class="highlight">zero downtime</span>.', {
  html: true,
  speed: 35
});
```

During each character tick, TypeFlow clones only the visible character slice while keeping all parent tags closed and well-formed.

## Allowlist & Attribute Filtering

TypeFlow enforces safe HTML defaults:

- **Allowed Tags**: `b`, `strong`, `i`, `em`, `mark`, `span`, `small`, `sub`, `sup`, `u`, `br`, `a`, `code`.
- **Attribute Filtering**: Strips all inline event handlers (`onclick`, `onload`, etc.) and javascript URI schemes (`javascript:`, `data:`).
- **Target `_blank` Protection**: Automatically adds `rel="noopener noreferrer"` to external anchor links.

### Extending Allowed Tags & Attributes

```javascript
TypeFlow.type('#custom', '<custom-tag class="chip" data-id="42">Custom content</custom-tag>', {
  html: true,
  allowedTags: ['custom-tag'],
  allowedAttributes: {
    'custom-tag': ['class', 'data-id']
  }
});
```

### Custom Sanitizer Hook

Supply a custom `sanitizer` function for specialized requirements (e.g. DOMPurify):

```javascript
import DOMPurify from 'dompurify';

TypeFlow.type('#output', rawUserInput, {
  html: true,
  sanitizer: (dirty) => DOMPurify.sanitize(dirty)
});
```
