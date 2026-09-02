---
title: Reveal, erase & caret index
description: Every typeStyle, eraseStyle, and Caret operation with a runnable code sample, a live demo, and a one-click link to try it in the playground.
eyebrow: Guides
category: Guides
keywords:
  - typeStyle
  - eraseStyle
  - reveal styles
  - erase styles
  - caret
  - index
  - reference
  - playground
---

## About This Index

Every value `typeStyle` and `eraseStyle` accept, plus every `Caret` operation, with a runnable code sample, a live demo, and a **Try in Playground** link that opens the same configuration ready to run. Use the on-page table of contents to jump straight to an entry.

The live demos below respect `prefers-reduced-motion`; with it enabled they render the finished state instead of animating.

---

## Reveal Styles (`typeStyle`)

### `char`

The default. Reveals text one grapheme at a time, left to right. [Try in Playground →](/playground/?typeStyle=char&text=Character+by+character.&speed=45)

<div class="index-demo" data-tf-demo='{"typeStyle":"char","text":"Character by character.","speed":45}'>Character by character.</div>

```javascript
TypeFlow.type('#el', 'Character by character.', { typeStyle: 'char', speed: 45 });
```

### `word`

Reveals one whitespace-delimited word at a time instead of one grapheme at a time. [Try in Playground →](/playground/?typeStyle=word&text=Streaming+word+by+word.&speed=90)

<div class="index-demo" data-tf-demo='{"typeStyle":"word","text":"Streaming word by word.","speed":90}'>Streaming word by word.</div>

```javascript
TypeFlow.type('#el', 'Streaming word by word.', { typeStyle: 'word', speed: 90 });
```

### `scramble`

Jitters through randomized glyphs before settling on each real character, matrix-decrypt style. [Try in Playground →](/playground/?typeStyle=scramble&text=Cybernetic+decrypt+reveal.&scrambleCharset=matrix&speed=40)

<div class="index-demo" data-tf-demo='{"typeStyle":"scramble","text":"Cybernetic decrypt reveal.","scrambleCharset":"matrix","speed":40}'>Cybernetic decrypt reveal.</div>

```javascript
TypeFlow.type('#el', 'Cybernetic decrypt reveal.', {
  typeStyle: 'scramble',
  scrambleCharset: 'matrix',
  scrambleRounds: 2,
  speed: 40,
});
```

### `fade-trail`

Reveals normally but keeps a soft trailing opacity ramp just behind the leading edge. [Try in Playground →](/playground/?typeStyle=fade-trail&text=Trailing+fade+dissolve+motion.&speed=42&trailFadeLength=6)

<div class="index-demo" data-tf-demo='{"typeStyle":"fade-trail","text":"Trailing fade dissolve motion.","speed":42,"trailFade":6}'>Trailing fade dissolve motion.</div>

```javascript
TypeFlow.type('#el', 'Trailing fade dissolve motion.', {
  typeStyle: 'fade-trail',
  trailFade: 6,
  speed: 42,
});
```

### `word-fade`

Lays out the finished text once, then fades each word from transparent to visible without shifting anything's position. [Try in Playground →](/playground/?typeStyle=word-fade&text=Stable-layout+word+fade+reveal.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"typeStyle":"word-fade","text":"Stable-layout word fade reveal.","wordFadeDuration":400,"wordStagger":200}'>Stable-layout word fade reveal.</div>

```javascript
TypeFlow.type('#el', 'Stable-layout word fade reveal.', {
  typeStyle: 'word-fade',
  wordOrder: 'left-to-right',
  wordFadeDuration: 400,
  wordStagger: 200,
});
```

### `float-in-top`

Same stable-layout word engine as `word-fade`, but each word also slides down into place from above. [Try in Playground →](/playground/?typeStyle=float-in-top&text=Words+arrive+from+above.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"typeStyle":"float-in-top","text":"Words arrive from above.","wordFadeDuration":400,"wordStagger":200}'>Words arrive from above.</div>

```javascript
TypeFlow.type('#el', 'Words arrive from above.', {
  typeStyle: 'float-in-top',
  wordFadeDuration: 400,
  wordStagger: 200,
});
```

### `float-in-bottom`

Words slide up into place from below as they fade in. [Try in Playground →](/playground/?typeStyle=float-in-bottom&text=Words+arrive+from+below.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"typeStyle":"float-in-bottom","text":"Words arrive from below.","wordFadeDuration":400,"wordStagger":200}'>Words arrive from below.</div>

```javascript
TypeFlow.type('#el', 'Words arrive from below.', {
  typeStyle: 'float-in-bottom',
  wordFadeDuration: 400,
  wordStagger: 200,
});
```

### `float-in-left`

Words slide in from the left as they fade in. [Try in Playground →](/playground/?typeStyle=float-in-left&text=Words+slide+in+from+the+left.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"typeStyle":"float-in-left","text":"Words slide in from the left.","wordFadeDuration":400,"wordStagger":200}'>Words slide in from the left.</div>

```javascript
TypeFlow.type('#el', 'Words slide in from the left.', {
  typeStyle: 'float-in-left',
  wordFadeDuration: 400,
  wordStagger: 200,
});
```

### `float-in-right`

Words slide in from the right as they fade in. [Try in Playground →](/playground/?typeStyle=float-in-right&text=Words+slide+in+from+the+right.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"typeStyle":"float-in-right","text":"Words slide in from the right.","wordFadeDuration":400,"wordStagger":200}'>Words slide in from the right.</div>

```javascript
TypeFlow.type('#el', 'Words slide in from the right.', {
  typeStyle: 'float-in-right',
  wordFadeDuration: 400,
  wordStagger: 200,
});
```

### `zoom-in-space`

Words scale up from depth using a CSS `perspective` transform as they fade in. [Try in Playground →](/playground/?typeStyle=zoom-in-space&text=Perspective+zoom+word+motion.&wordFadeDuration=450&wordStagger=225)

<div class="index-demo" data-tf-demo='{"typeStyle":"zoom-in-space","text":"Perspective zoom word motion.","wordFadeDuration":450,"wordStagger":225}'>Perspective zoom word motion.</div>

```javascript
TypeFlow.type('#el', 'Perspective zoom word motion.', {
  typeStyle: 'zoom-in-space',
  wordFadeDuration: 450,
  wordStagger: 225,
});
```

---

## Erase Styles (`eraseStyle`)

### `end`

The default. Backspace-style: removes characters from the right. [Try in Playground →](/playground/?eraseStyle=end&text=Right-to-left+backspace+erase.&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"end","text":"Right-to-left backspace erase.","speed":45}'>Right-to-left backspace erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'end', speed: 24 });
```

### `start`

Removes characters from the left; the tail stays in place until the very end. [Try in Playground →](/playground/?eraseStyle=start&text=Left-to-right+erosion+erase.&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"start","text":"Left-to-right erosion erase.","speed":45}'>Left-to-right erosion erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'start', speed: 24 });
```

### `center`

Shrinks inward symmetrically from both edges toward the center. [Try in Playground →](/playground/?eraseStyle=center&text=Center-inward+shrink+erase.&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"center","text":"Center-inward shrink erase.","speed":45}'>Center-inward shrink erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'center', speed: 24 });
```

### `scramble`

Scrambles characters into randomized glyphs before clearing them. [Try in Playground →](/playground/?eraseStyle=scramble&text=Matrix+decrypt+erase.&scrambleCharset=matrix&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"scramble","text":"Matrix decrypt erase.","scrambleCharset":"matrix","speed":45}'>Matrix decrypt erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'scramble', scrambleCharset: 'matrix', scrambleRounds: 1, speed: 25 });
```

### `fade-trail`

Dissolves the trailing characters with a soft opacity ramp as it erases. [Try in Playground →](/playground/?eraseStyle=fade-trail&text=Trailing+opacity+erase.&speed=45&trailFadeLength=6)

<div class="index-demo" data-tf-demo='{"eraseStyle":"fade-trail","text":"Trailing opacity erase.","speed":45,"trailFade":6}'>Trailing opacity erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'fade-trail', trailFade: 6, speed: 20 });
```

### `instant`

Clears the content immediately, with no animation. [Try in Playground →](/playground/?eraseStyle=instant&text=Immediate+reset+erase.&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"instant","text":"Immediate reset erase."}'>Immediate reset erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'instant' });
```

### `fade`

A CSS opacity cross-fade on the whole element, then it clears. [Try in Playground →](/playground/?eraseStyle=fade&text=Smooth+opacity+fade+erase.&speed=45)

<div class="index-demo" data-tf-demo='{"eraseStyle":"fade","text":"Smooth opacity fade erase."}'>Smooth opacity fade erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'fade', duration: 350 });
```

### `word-fade`

Fades words out in place, without shifting the words that remain. [Try in Playground →](/playground/?eraseStyle=word-fade&text=Stable-layout+word+fade+erase.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"eraseStyle":"word-fade","text":"Stable-layout word fade erase.","wordFadeDuration":400,"wordStagger":200}'>Stable-layout word fade erase.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'word-fade', wordFadeDuration: 400, wordStagger: 200 });
```

### `float-in-top`

Words fade out while sliding up and away. [Try in Playground →](/playground/?eraseStyle=float-in-top&text=Words+leave+upward.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"eraseStyle":"float-in-top","text":"Words leave upward.","wordFadeDuration":400,"wordStagger":200}'>Words leave upward.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'float-in-top', wordFadeDuration: 400, wordStagger: 200 });
```

### `float-in-bottom`

Words fade out while sliding down and away. [Try in Playground →](/playground/?eraseStyle=float-in-bottom&text=Words+leave+downward.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"eraseStyle":"float-in-bottom","text":"Words leave downward.","wordFadeDuration":400,"wordStagger":200}'>Words leave downward.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'float-in-bottom', wordFadeDuration: 400, wordStagger: 200 });
```

### `float-in-left`

Words fade out while sliding left and away. [Try in Playground →](/playground/?eraseStyle=float-in-left&text=Words+leave+leftward.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"eraseStyle":"float-in-left","text":"Words leave leftward.","wordFadeDuration":400,"wordStagger":200}'>Words leave leftward.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'float-in-left', wordFadeDuration: 400, wordStagger: 200 });
```

### `float-in-right`

Words fade out while sliding right and away. [Try in Playground →](/playground/?eraseStyle=float-in-right&text=Words+leave+rightward.&wordFadeDuration=400&wordStagger=200)

<div class="index-demo" data-tf-demo='{"eraseStyle":"float-in-right","text":"Words leave rightward.","wordFadeDuration":400,"wordStagger":200}'>Words leave rightward.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'float-in-right', wordFadeDuration: 400, wordStagger: 200 });
```

### `zoom-in-space`

Words fade out while shrinking back into depth. [Try in Playground →](/playground/?eraseStyle=zoom-in-space&text=Words+recede+into+depth.&wordFadeDuration=450&wordStagger=225)

<div class="index-demo" data-tf-demo='{"eraseStyle":"zoom-in-space","text":"Words recede into depth.","wordFadeDuration":450,"wordStagger":225}'>Words recede into depth.</div>

```javascript
TypeFlow.erase('#el', { eraseStyle: 'zoom-in-space', wordFadeDuration: 450, wordStagger: 225 });
```

---

## Caret Operations

`Caret` is a separate, opt-in, zero-dependency module (`@staticcanvas/typeflow/caret`) — see the [companion extensions guide](/guides/extensions/#6-interactive-caret-staticcanvastypeflowcaret) for the full API and how it relates to the core engine. It has no playground panel of its own yet, so there is no **Try in Playground** link for these entries; each demo below runs the exact code shown.

### `jump(position)`

Moves the caret to an absolute grapheme index, clamped to the text's bounds.

<div class="index-demo" data-tf-caret-demo='{"text":"git commit -m wip","steps":[{"op":"jump","args":[4]}]}'>git commit -m wip</div>

```javascript
import { Caret } from '@staticcanvas/typeflow/caret';

const caret = Caret('#el', { text: 'git commit -m wip' });
caret.jump(4);
```

### `move(delta)`

Moves the caret by a relative number of graphemes: positive moves right, negative moves left.

<div class="index-demo" data-tf-caret-demo='{"text":"npm run build","steps":[{"op":"move","args":[-5]}]}'>npm run build</div>

```javascript
const caret = Caret('#el', { text: 'npm run build' });
caret.move(-5);
```

### `deleteChar(direction)`

Deletes one grapheme: `'backward'` (Backspace, default) removes the character before the caret; `'forward'` (Delete) removes the character at/after it.

<div class="index-demo" data-tf-caret-demo='{"text":"Hello world","steps":[{"op":"jump","args":[11]},{"op":"deleteChar","args":["backward"]},{"op":"deleteChar","args":["backward"]}]}'>Hello world</div>

```javascript
const caret = Caret('#el', { text: 'Hello world' });
caret.jump(11).deleteChar('backward').deleteChar('backward');
// "Hello wor"
```

### `deleteWord(direction)`

Deletes the whitespace-delimited word adjacent to the caret, consuming the adjoining whitespace with it.

<div class="index-demo" data-tf-caret-demo='{"text":"git commit -m wip","steps":[{"op":"jump","args":[17]},{"op":"deleteWord","args":["backward"]}]}'>git commit -m wip</div>

```javascript
const caret = Caret('#el', { text: 'git commit -m wip' });
caret.jump(17).deleteWord('backward');
// "git commit -m "
```

### `insert(text, config)`

Types `text` in at the caret position, one grapheme at a time, shifting following content to the right. Returns `{ stop, promise }` like `TypeFlow.type()`.

<div class="index-demo" data-tf-caret-demo='{"text":"git commit","steps":[{"op":"jump","args":[4]},{"op":"insert","args":["push --force "]}]}'>git commit</div>

```javascript
const caret = Caret('#el', { text: 'git commit' });
caret.jump(4);
await caret.insert('push --force ').promise;
// "git push --force commit"
```
