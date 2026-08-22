/**
 * @fileoverview TypeFlow Documentation — Interactive Scripts
 *
 * Responsibilities:
 *  - Theme (dark/light) persistence and toggle
 *  - Code block copy-to-clipboard
 *  - Code tab widget switching
 *  - Live hero typewriter demonstration
 *  - Interactive playground workbench
 *  - Client-side JSON search
 *  - TOC active section highlighting via IntersectionObserver
 *  - Mobile sidebar open/close
 *
 * @module docs
 */

import { TypeFlow, seq } from '../webutil/libs/typeflow.esm.js';
import { TypeFlowMetrics } from '../webutil/libs/typeflow-metrics.js';
import { TypeFlowDebug } from '../webutil/libs/typeflow-debug.js';

const root = document.documentElement;

// ─── Theme Toggle ────────────────────────────────────────────────────────────

/**
 * Reads the persisted theme from localStorage and toggles between
 * `dark` and `light` on the root `<html>` element's `data-theme` attribute.
 * Persists the new value to `localStorage` under the key
 * `'typeflow-docs-theme'`.
 *
 * @listens click - on `[data-theme-toggle]` button
 */
const themeToggleBtn = document.querySelector('[data-theme-toggle]');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    localStorage.setItem('typeflow-docs-theme', nextTheme);
    initMermaid(nextTheme);
  });
}

// ─── Mermaid.js Integration ───────────────────────────────────────────────────

/**
 * Builds a Mermaid theme variables object matched to the TypeFlow docs palette.
 * @param {'dark'|'light'} theme
 * @returns {object} Mermaid themeVariables config
 */
function getMermaidThemeVars(theme) {
  const dark = theme !== 'light';
  return {
    // Base backgrounds
    background:          dark ? '#090d16' : '#f8fafc',
    mainBkg:             dark ? '#0f172a' : '#ffffff',
    nodeBorder:          dark ? '#253347' : '#cbd5e1',
    clusterBkg:          dark ? '#1e293b' : '#f1f5f9',
    titleColor:          dark ? '#f1f5f9' : '#0f172a',
    edgeLabelBackground: dark ? '#1e293b' : '#f1f5f9',

    // Text
    nodeTextColor:       dark ? '#f1f5f9' : '#0f172a',
    textColor:           dark ? '#94a3b8' : '#475569',
    labelTextColor:      dark ? '#f1f5f9' : '#0f172a',

    // Primary accent (sky blue)
    primaryColor:        dark ? '#0c2340' : '#e0f2fe',
    primaryBorderColor:  dark ? '#38bdf8' : '#0284c7',
    primaryTextColor:    dark ? '#38bdf8' : '#0284c7',

    // Secondary accent (orange)
    secondaryColor:      dark ? '#2a1200' : '#fff7ed',
    secondaryBorderColor:dark ? '#fb923c' : '#ea580c',
    secondaryTextColor:  dark ? '#fb923c' : '#ea580c',

    // Tertiary accent (purple)
    tertiaryColor:       dark ? '#1a0e2e' : '#faf5ff',
    tertiaryBorderColor: dark ? '#a78bfa' : '#7c3aed',
    tertiaryTextColor:   dark ? '#a78bfa' : '#7c3aed',

    // Lines / borders
    lineColor:           dark ? '#334155' : '#94a3b8',
    activationBorderColor: dark ? '#38bdf8' : '#0284c7',
    activationBkgColor:  dark ? '#0c2340' : '#e0f2fe',

    // Sequence diagram participants
    actorBkg:            dark ? '#0f172a' : '#ffffff',
    actorBorder:         dark ? '#253347' : '#cbd5e1',
    actorTextColor:      dark ? '#f1f5f9' : '#0f172a',
    actorLineColor:      dark ? '#334155' : '#94a3b8',

    // Signals / notes
    signalColor:         dark ? '#94a3b8' : '#475569',
    signalTextColor:     dark ? '#f1f5f9' : '#0f172a',
    noteBkgColor:        dark ? '#1e293b' : '#f1f5f9',
    noteBorderColor:     dark ? '#253347' : '#e2e8f0',
    noteTextColor:       dark ? '#94a3b8' : '#475569',

    // Fonts
    fontFamily:          "'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace",
    fontSize:            '13px',
  };
}

/**
 * Initialises (or re-initialises) Mermaid with the current theme.
 * Processes any `.language-mermaid` code blocks Hugo emits and wraps
 * them in a `.mermaid-diagram` container with toolbar controls.
 * @param {'dark'|'light'} [theme]
 */
async function initMermaid(theme) {
  const mermaid = window.mermaid;
  if (!mermaid) return;

  theme = theme || root.dataset.theme || 'dark';

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: getMermaidThemeVars(theme),
    securityLevel: 'strict',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    flowchart: { curve: 'basis', padding: 20 },
    sequence: { actorMargin: 60, useMaxWidth: false },
    gantt: { useMaxWidth: false },
  });

  // Hugo renders ```mermaid as <pre><code class="language-mermaid">
  // Mermaid itself also reads <div class="mermaid"> — handle both.
  const codeBlocks = document.querySelectorAll('pre code.language-mermaid');

  for (const code of codeBlocks) {
    const pre = code.closest('pre');
    if (!pre || pre.dataset.mermaidProcessed) continue;
    pre.dataset.mermaidProcessed = '1';

    const definition = code.textContent.trim();
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-diagram';
    wrapper.innerHTML = `
      <div class="mermaid-toolbar">
        <span class="mermaid-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="m9 9 3 3 3-3"/><path d="M12 12v6"/></svg> Diagram</span>
        <button type="button" class="mermaid-copy-btn" title="Copy source"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
      </div>
      <div class="mermaid-render" id="mermaid-${Math.random().toString(36).slice(2)}"></div>
    `;

    const renderTarget = wrapper.querySelector('.mermaid-render');
    const copyBtn = wrapper.querySelector('.mermaid-copy-btn');

    pre.replaceWith(wrapper);

    try {
      const { svg } = await mermaid.render(renderTarget.id, definition);
      renderTarget.innerHTML = svg;
      // Make SVG responsive
      const svgEl = renderTarget.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        if (!svgEl.getAttribute('viewBox')) {
          svgEl.setAttribute('viewBox', `0 0 ${svgEl.getAttribute('width') || 800} ${svgEl.getAttribute('height') || 400}`);
        }
        svgEl.style.maxWidth = '100%';
        svgEl.style.height = 'auto';
      }
    } catch (err) {
      renderTarget.innerHTML = `<pre class="mermaid-error">⚠ Diagram parse error:\n${err.message}</pre>`;
    }

    // Copy button
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(definition);
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => { copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`; }, 1800);
      } catch {}
    });
  }

  // Also process any raw <div class="mermaid"> blocks (e.g. from shortcodes)
  const rawDivs = document.querySelectorAll('div.mermaid:not([data-mermaid-processed])');
  if (rawDivs.length) {
    rawDivs.forEach(el => { el.dataset.mermaidProcessed = '1'; });
    mermaid.run({ nodes: [...rawDivs] });
  }
}

// Boot Mermaid once the module is loaded — use a small delay so mermaid.esm is ready
window.addEventListener('load', () => setTimeout(() => initMermaid(), 80));

// ─── Mobile Sidebar Toggle ───────────────────────────────────────────────────

/**
 * Controls the mobile navigation drawer. Toggles the `.is-open` class on
 * `#site-sidebar` and updates the `aria-expanded` attribute on the trigger
 * button. Closes the drawer when any sidebar link is activated.
 *
 * @listens click - on `[data-menu-toggle]` button
 */
const menuToggleBtn = document.querySelector('[data-menu-toggle]');
const sidebar = document.getElementById('site-sidebar');
if (menuToggleBtn && sidebar) {
  menuToggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('is-open');
    menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link activation within the sidebar
  sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('is-open');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close when clicking the page backdrop
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('is-open') && !e.target.closest('#site-sidebar') && !e.target.closest('[data-menu-toggle]')) {
      sidebar.classList.remove('is-open');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ─── View Transitions — Same-Document Navigation ─────────────────────────────

/**
 * Intercepts clicks on internal navigation links and wraps the browser's
 * native page navigation inside `document.startViewTransition()` so that
 * the CSS ::view-transition-* animations fire.
 *
 * Cross-document @view-transition { navigation: auto } in docs.css handles
 * browsers that support it natively (Chrome 126+). This JS layer handles
 * same-origin SPA-style links for all VT-capable browsers and ensures the
 * active sidebar link is updated before the transition snapshot is taken.
 *
 * Falls back silently to a normal link click when the API is unavailable.
 */
if ('startViewTransition' in document) {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');

    // Ignore: external links, hash-only anchors, download links, new-tab targets
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      anchor.hasAttribute('download') ||
      anchor.target === '_blank' ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    ) return;

    // Ignore links outside the doc nav (only animate sidebar + header nav links)
    const isNavLink = anchor.closest('#site-sidebar, .header-actions, .doc-article, .doc-toc');
    if (!isNavLink) return;

    e.preventDefault();

    // Update active sidebar link state immediately so VT snapshot captures it
    document.querySelectorAll('.sidebar-link').forEach((l) => {
      const lHref = l.getAttribute('href');
      const isCurrent = lHref && (href === lHref || href.startsWith(lHref.replace(/\/$/, '') + '/'));
      l.classList.toggle('active', isCurrent);
      if (isCurrent) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });

    document.startViewTransition(() => {
      window.location.assign(href);
    });
  });
}

// ─── Keyboard Search Shortcut & Modal Triggers ───────────────────────────────

/**
 * Opens the 2-column search popup modal.
 */
export const openSearchModal = () => {
  const modal = document.getElementById('typeflow-search-modal');
  const input = document.getElementById('search-modal-input');
  if (modal) {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      input?.focus();
      input?.select();
    }, 40);
  }
};

/**
 * Closes the search popup modal.
 */
export const closeSearchModal = () => {
  const modal = document.getElementById('typeflow-search-modal');
  if (modal) {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const modal = document.getElementById('typeflow-search-modal');
    if (modal && !modal.hasAttribute('hidden')) {
      closeSearchModal();
    } else {
      openSearchModal();
    }
  } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    openSearchModal();
  } else if (e.key === 'Escape') {
    closeSearchModal();
  }
});

document.querySelectorAll('[data-search-trigger]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openSearchModal();
  });
});

document.querySelectorAll('[data-search-close]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    closeSearchModal();
  });
});

// Dynamic rotating search suggestions in the header search trigger
const searchPlaceholderEl = document.querySelector('.search-trigger-placeholder');
if (searchPlaceholderEl) {
  searchPlaceholderEl.textContent = '';
  TypeFlow.rotate(
    searchPlaceholderEl,
    [
      'Search docs, APIs, and guides...',
      'Try "webaudio" sound effects...',
      'Try "fade-trail" soft reveals...',
      'Try "matrix" decrypt presets...',
      'Try "react" & "solid" adapters...',
      'Try "accessibility" & WCAG...',
    ],
    {
      holdDuration: 3000,
      pauseBetween: 200,
      respectReducedMotion: false,
      typeConfig: { speed: 2, cursor: '|', cursorBlink: true },
      eraseConfig: { speed: 2, eraseStyle: 'end' },
    }
  );
}

// ─── Copy Code Buttons ───────────────────────────────────────────────────────

/**
 * Attaches clipboard copy behaviour to elements with a `data-copy` attribute.
 * The attribute value is the text written to the clipboard.
 *
 * @listens click - on `[data-copy]` elements
 */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = /** @type {string} */ (btn.dataset.copy);
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    } catch {}
  });
});

/**
 * Appends a "Copy" button to every `<pre>` element that does not already
 * contain one. Clicking the button writes the block's text content to the
 * clipboard.
 */
document.querySelectorAll('pre').forEach((pre) => {
  if (pre.querySelector('.copy-button')) return;

  const btn = document.createElement('button');
  btn.className = 'copy-button';
  btn.type = 'button';
  btn.textContent = 'Copy';

  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    } catch {}
  });

  pre.classList.add('copy-wrap');
  pre.appendChild(btn);
});

// ─── Code Tab Switching ───────────────────────────────────────────────────────

/**
 * Initialises tab-panel switching inside `[data-code-tabs]` containers.
 * Each tab button must carry a `data-code-tab` attribute whose value matches
 * the `data-code-panel` attribute on the corresponding panel element.
 *
 * @listens click - on `[data-code-tab]` buttons within each tabset
 */
document.querySelectorAll('[data-code-tabs]').forEach((tabset) => {
  const tabs   = /** @type {HTMLButtonElement[]} */ ([...tabset.querySelectorAll('[data-code-tab]')]);
  const panels = /** @type {HTMLElement[]} */ ([...tabset.querySelectorAll('[data-code-panel]')]);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach((p) => { p.hidden = p.dataset.codePanel !== tab.dataset.codeTab; });
    });
  });
});

// ─── Hero Slogan Multi-Style Sequence ───────────────────────────────────────

/**
 * Cycles through distinct slogan points on the splash page hero heading, each
 * demonstrating a different TypeFlow animation mode (standard char typewriter,
 * matrix scramble reveal & decay, word-by-word reveal with fade erase,
 * natural human cadence with left-erosion, and HTML formatting with instant clear).
 */
const heroSloganEl = document.getElementById('hero-slogan');
const heroModeText = document.getElementById('hero-mode-text');

if (heroSloganEl) {
  const setMode = (label) => {
    if (heroModeText) {
      heroModeText.textContent = label;
    }
  };

  const sloganSteps = [
    // 1. Classic Character Typewriter + Backspace Erase
    seq.call(() => setMode('typeStyle: char · eraseStyle: end (backspace)')),
    seq.type(heroSloganEl, 'typewriter animations.', {
      typeStyle: 'char',
      speed: 55,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'end',
      speed: 28,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 2. Multi-Directional Reveal & Erasing (Center-Outward & Inward)
    seq.call(() => setMode('direction: center · eraseStyle: center (inward shrink)')),
    seq.type(heroSloganEl, 'multi-directional reveals & erasing.', {
      direction: 'center',
      speed: 40,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'center',
      speed: 24,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 3. Cybernetic Matrix Decrypt Reveal + Matrix Scramble Decay
    seq.call(() => setMode('typeStyle: scramble · scrambleCharset: matrix')),
    seq.type(heroSloganEl, 'cybernetic matrix decrypt.', {
      typeStyle: 'scramble',
      scrambleCharset: 'matrix',
      scrambleRounds: 2,
      speed: 44,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'scramble',
      scrambleCharset: 'matrix',
      scrambleRounds: 1,
      speed: 22,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 4. Smart Morph Diffing
    seq.call(() => setMode('TypeFlow.morph() · longest common prefix')),
    seq.type(heroSloganEl, 'smart diff morphing.', {
      speed: 45,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'start',
      speed: 25,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 5. Real-Time LLM Token Streaming
    seq.call(() => setMode('TypeFlow.stream() · zero DOM lag')),
    seq.type(heroSloganEl, 'real-time llm token streaming.', {
      typeStyle: 'word',
      speed: 40,
      cursor: '▍',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'fade',
      duration: 350,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 6. Procedural Web Audio Clicks
    seq.call(() => setMode('audio: mechanical · Web Audio API')),
    seq.type(heroSloganEl, 'procedural web audio clicks.', {
      speed: 45,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'end',
      speed: 25,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 7. Human Natural Cadence + Left-to-Right Erosion
    seq.call(() => setMode('naturalCadence: true · speedVariance: 22ms')),
    seq.type(heroSloganEl, 'natural human cadence.', {
      naturalCadence: true,
      speed: 52,
      speedVariance: 22,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'start',
      speed: 26,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 8. HTML Token Formatting & Nested Tag Typing + Backspace Erase
    seq.call(() => setMode('html: true · allowlist sanitization')),
    seq.type(heroSloganEl, 'safe html &amp; tag balancing.', {
      html: true,
      speed: 45,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'end',
      speed: 25,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 9. Rapid Burst Keystrokes + Left-to-Right Erosion
    seq.call(() => setMode('speed: 28ms (burst mode) · <7kb gzipped')),
    seq.type(heroSloganEl, 'ultra-fast zero dependency.', {
      typeStyle: 'char',
      speed: 28,
      cursor: '▍',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'start',
      speed: 20,
      respectReducedMotion: false,
    }),
    seq.pause(450),

    // 10. Declarative Sequences & Viewport Triggers
    seq.call(() => setMode('TypeFlow.sequence() · seq.visible()')),
    seq.type(heroSloganEl, 'declarative sequences & rotators.', {
      speed: 45,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }),
    seq.pause(2600),
    seq.erase(heroSloganEl, {
      eraseStyle: 'fade',
      duration: 350,
      respectReducedMotion: false,
    }),
    seq.pause(450),
  ];

  TypeFlow.sequence(sloganSteps, { repeat: Infinity });
}

// ─── Hero Staggered Terminal Demo ─────────────────────────────────────────────

/**
 * Runs a 4-line staggered typewriter sequence in the hero terminal using
 * {@link TypeFlow.stagger}.
 */
const line1 = document.getElementById('hero-type-1');
const line2 = document.getElementById('hero-type-2');
const line3 = document.getElementById('hero-type-3');
const line4 = document.getElementById('hero-type-4');

if (line1 && line2 && line3 && line4) {
  const terminalLines = [line1, line2, line3, line4];
  const terminalTexts = [
    'npm install @staticcanvas/typeflow',
    'import { TypeFlow } from "@staticcanvas/typeflow";',
    'TypeFlow.stagger(".terminal-lines", texts, { stagger: 200 });',
    '✨ All systems operational · Ready for production'
  ];

  const runTerminalStagger = () => {
    terminalLines.forEach((l) => {
      TypeFlow.stop(l);
      l.textContent = '';
    });
    TypeFlow.stagger(terminalLines, terminalTexts, {
      speed: 28,
      stagger: 320,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
    }).promise.then(() => {
      setTimeout(async () => {
        await Promise.all(
          terminalLines.map((l) =>
            TypeFlow.erase(l, { eraseStyle: 'fade', duration: 300 }).promise
          )
        );
        terminalLines.forEach((l) => {
          TypeFlow.stop(l);
          l.textContent = '';
        });
        setTimeout(runTerminalStagger, 800);
      }, 5000);
    });
  };

  runTerminalStagger();
}

// ─── Lucide Icons Initialization ─────────────────────────────────────────────

const initIcons = () => {
  if (typeof window !== 'undefined' && window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
};
initIcons();

// ─── Splash Animation Matrix Showcase Grid ───────────────────────────────────

const initAnimationMatrixGrid = () => {
  const matrixGrid = document.getElementById('animation-matrix-grid');
  if (!matrixGrid) return;

  const cardConfigs = {
    'char-end': {
      stageId: 'matrix-stage-1',
      text: 'Standard character typewriter with backspace erasure.',
      typeOpts: { speed: 40, cursor: '|', cursorBlink: true },
      eraseOpts: { eraseStyle: 'end', speed: 22 },
      hold: 2400,
    },
    'word-word': {
      stageId: 'matrix-stage-2',
      text: 'High-velocity token streaming word by word.',
      typeOpts: { typeStyle: 'word', speed: 50, cursor: '|' },
      eraseOpts: { eraseStyle: 'word', speed: 30 },
      hold: 2400,
    },
    'fade-trail': {
      stageId: 'matrix-stage-3',
      text: 'Smooth trailing fade opacity gradient dissolve.',
      typeOpts: { typeStyle: 'fade-trail', trailFade: 5, trailingFadeLength: 5, speed: 36, cursor: '' },
      eraseOpts: { eraseStyle: 'fade-trail', trailFade: 5, trailingFadeLength: 5, speed: 22 },
      hold: 2500,
    },
    'scramble-matrix': {
      stageId: 'matrix-stage-4',
      text: 'CYBERNETIC MATRIX CIPHER DECRYPT INITIALIZED',
      typeOpts: { typeStyle: 'scramble', scrambleCharset: 'matrix', scrambleRounds: 2, speed: 38, cursor: '■' },
      eraseOpts: { eraseStyle: 'scramble', scrambleCharset: 'matrix', speed: 20 },
      hold: 2400,
    },
    'direction-center': {
      stageId: 'matrix-stage-5',
      text: 'Expanding symmetrically from the exact center.',
      typeOpts: { direction: 'center', speed: 36, cursor: '|' },
      eraseOpts: { eraseStyle: 'center', speed: 24 },
      hold: 2400,
    },
    'direction-right': {
      stageId: 'matrix-stage-6',
      text: 'Reverse right-to-left character streaming flow.',
      typeOpts: { direction: 'right', speed: 36, cursor: '|' },
      eraseOpts: { eraseStyle: 'start', speed: 24 },
      hold: 2400,
    },
    'morph-smart': {
      stageId: 'matrix-stage-7',
      text: 'TypeFlow Engine v1.0',
      morphs: ['TypeFlow Engine v2.0 Next', 'TypeFlow Engine v3.0 Ultra', 'TypeFlow Engine v1.0'],
      typeOpts: { speed: 38, cursor: '|' },
      hold: 2000,
    },
    'scramble-runes': {
      stageId: 'matrix-stage-8',
      text: 'ᚠᚢᚦᚨᚱᚲ ANCIENT RUNIC GLYPH DECODER',
      typeOpts: { typeStyle: 'scramble', scrambleCharset: 'runic', scrambleRounds: 2, speed: 38, cursor: '|' },
      eraseOpts: { eraseStyle: 'end', speed: 22 },
      hold: 2400,
    },
    'natural-cadence': {
      stageId: 'matrix-stage-9',
      text: 'Natural human cadence, with punctuation... pauses!',
      typeOpts: { naturalCadence: true, speed: 45, speedVariance: 25, cursor: '|' },
      eraseOpts: { eraseStyle: 'end', speed: 24 },
      hold: 2400,
    },
    'instant-reset': {
      stageId: 'matrix-stage-10',
      text: 'Instantaneous zero-frame tactical clear and reset.',
      typeOpts: { speed: 34, cursor: '|' },
      eraseOpts: { eraseStyle: 'instant' },
      hold: 2200,
    },
    'scramble-hieroglyphs': {
      stageId: 'matrix-stage-11',
      text: '𓂀𓃀𓃁 HIEROGLYPHIC SACRED SCRAMBLE DECRYPT',
      typeOpts: { typeStyle: 'scramble', scrambleCharset: 'hieroglyphs', scrambleRounds: 2, speed: 38, cursor: '▍' },
      eraseOpts: { eraseStyle: 'scramble', scrambleCharset: 'hieroglyphs', speed: 20 },
      hold: 2400,
    },
    'stagger-engine': {
      stageId: 'matrix-stage-12',
      lines: ['System check... [OK]', 'Cascade initialized! [READY]'],
      hold: 2200,
    },
  };

  const cardControllers = new Map();
  const cardGenerations = new Map();

  const runCardAnimation = async (id) => {
    const config = cardConfigs[id];
    if (!config) return;
    const el = document.getElementById(config.stageId);
    if (!el) return;

    const gen = (cardGenerations.get(id) || 0) + 1;
    cardGenerations.set(id, gen);
    const isCurrent = () => cardGenerations.get(id) === gen;

    cardControllers.get(id)?.stop();
    el.innerHTML = '';

    if (id === 'morph-smart') {
      const activeCtrl = TypeFlow.type(el, config.text, {
        speed: 38,
        cursor: '|',
        cursorBlink: true,
        respectReducedMotion: false,
        ...config.typeOpts,
      });
      cardControllers.set(id, activeCtrl);
      await activeCtrl.promise;
      if (!isCurrent()) return;
      await new Promise((r) => setTimeout(r, config.hold));
      if (!isCurrent()) return;

      for (const target of config.morphs) {
        const morphCtrl = TypeFlow.morph(el, target, {
          speed: 32,
          cursor: '|',
          cursorBlink: true,
          respectReducedMotion: false,
        });
        cardControllers.set(id, morphCtrl);
        await morphCtrl.promise;
        if (!isCurrent()) return;
        await new Promise((r) => setTimeout(r, config.hold));
        if (!isCurrent()) return;
      }
      setTimeout(() => { if (isCurrent()) runCardAnimation(id); }, 600);
      return;
    }

    if (id === 'stagger-engine') {
      el.innerHTML = config.lines.map((l, i) => `<div class="matrix-stagger-line-${i}" style="height:1.4em;line-height:1.4em;"></div>`).join('');
      const lineEls = config.lines.map((_, i) => el.querySelector(`.matrix-stagger-line-${i}`));
      const seqCtrl = TypeFlow.stagger(lineEls, config.lines, {
        stagger: 220,
        speed: 28,
        cursor: '',
        respectReducedMotion: false,
      });
      cardControllers.set(id, seqCtrl);
      await seqCtrl.promise;
      if (!isCurrent()) return;
      await new Promise((r) => setTimeout(r, config.hold));
      if (!isCurrent()) return;
      setTimeout(() => { if (isCurrent()) runCardAnimation(id); }, 500);
      return;
    }

    const typeCtrl = TypeFlow.type(el, config.text, {
      speed: 40,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: false,
      ...config.typeOpts,
    });
    cardControllers.set(id, typeCtrl);
    await typeCtrl.promise;
    if (!isCurrent()) return;

    await new Promise((r) => setTimeout(r, config.hold));
    if (!isCurrent()) return;

    const eraseCtrl = TypeFlow.erase(el, {
      speed: 24,
      respectReducedMotion: false,
      ...config.eraseOpts,
    });
    cardControllers.set(id, eraseCtrl);
    await eraseCtrl.promise;
    if (!isCurrent()) return;

    await new Promise((r) => setTimeout(r, 500));
    if (isCurrent()) runCardAnimation(id);
  };

  // Observe grid to start animations when approaching viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        Object.keys(cardConfigs).forEach((id, idx) => {
          setTimeout(() => runCardAnimation(id), idx * 120);
        });
        observer.disconnect();
      }
    });
  }, { rootMargin: '150px 0px 150px 0px', threshold: 0 });

  observer.observe(matrixGrid);

  // Bind individual replay buttons
  document.querySelectorAll('[data-matrix-replay]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.matrixReplay;
      if (id) runCardAnimation(id);
    });
  });
};

initAnimationMatrixGrid();

// ─── Interactive Playground Workbench ────────────────────────────────────────

const pgStage            = document.getElementById('pg-stage');
const pgPresetSelect     = document.getElementById('pg-preset-select');
const pgSampleSelect     = document.getElementById('pg-sample-select');
const pgText             = document.getElementById('pg-text');
const pgDirection        = document.getElementById('pg-direction');
const pgTypeStyle        = document.getElementById('pg-type-style');
const pgScrambleCharset  = document.getElementById('pg-scramble-charset');
const pgScrambleColor    = document.getElementById('pg-scramble-color');
const pgScrambleRounds   = document.getElementById('pg-scramble-rounds');
const pgScrambleRoundsVal= document.getElementById('pg-scramble-rounds-val');
const pgFadeTrailLen     = document.getElementById('pg-fade-trail-len');
const pgFadeTrailLenVal  = document.getElementById('pg-fade-trail-len-val');
const pgFadeTrailMinOp   = document.getElementById('pg-fade-trail-min-op');
const pgFadeTrailMinOpVal= document.getElementById('pg-fade-trail-min-op-val');
const pgEraseStyle       = document.getElementById('pg-erase-style');
const pgSpeed            = document.getElementById('pg-speed');
const pgSpeedVal         = document.getElementById('pg-speed-val');
const pgSpeedVariance    = document.getElementById('pg-speed-variance');
const pgSpeedVarianceVal = document.getElementById('pg-speed-variance-val');
const pgDelay            = document.getElementById('pg-delay');
const pgDelayVal         = document.getElementById('pg-delay-val');
const pgStagger          = document.getElementById('pg-stagger');
const pgStaggerVal       = document.getElementById('pg-stagger-val');
const pgFadeDuration     = document.getElementById('pg-fade-duration');
const pgFadeDurationVal  = document.getElementById('pg-fade-duration-val');
const pgAudio            = document.getElementById('pg-audio');
const pgFontSize         = document.getElementById('pg-font-size');
const pgFontSizeVal      = document.getElementById('pg-font-size-val');
const pgFontFamily       = document.getElementById('pg-font-family');
const pgTextAlign        = document.getElementById('pg-text-align');
const pgCursorChar       = document.getElementById('pg-cursor-char');
const pgGranularity      = document.getElementById('pg-granularity');
const pgMode             = document.getElementById('pg-mode');
const pgHtml             = document.getElementById('pg-html');
const pgNaturalCadence   = document.getElementById('pg-natural-cadence');
const pgCursorBlink      = document.getElementById('pg-cursor-blink');
const pgReducedMotion    = document.getElementById('pg-reduced-motion');
const pgMetricsToggle    = document.getElementById('pg-metrics-toggle');
const pgDebugToggle      = document.getElementById('pg-debug-toggle');

const pgStatusDot        = document.getElementById('pg-status-dot');
const pgStatusText       = document.getElementById('pg-status-text');
const pgMetaChars        = document.getElementById('pg-meta-chars');
const pgMetaFont         = document.getElementById('pg-meta-font');
const pgCodeSnippet      = document.getElementById('pg-code-snippet');

const btnType            = document.getElementById('pg-btn-type');
const btnErase           = document.getElementById('pg-btn-erase');
const btnMorph           = document.getElementById('pg-btn-morph');
const btnStream          = document.getElementById('pg-btn-stream');
const btnRotator         = document.getElementById('pg-btn-rotator');
const btnStop            = document.getElementById('pg-btn-stop');
const btnReset           = document.getElementById('pg-btn-reset');
const btnClear           = document.getElementById('pg-btn-clear');
const btnMetrics         = document.getElementById('pg-btn-metrics');
const btnDebug           = document.getElementById('pg-btn-debug');
const btnCopyCode        = document.getElementById('pg-btn-copy-code');

if (pgStage && btnType) {
  /** @type {import('../webutil/libs/typeflow.esm.js').TypeFlowController | null} */
  let activeController = null;
  let activeStream = null;

  const setStatus = (status, isActive = false) => {
    if (pgStatusText) pgStatusText.textContent = status;
    if (pgStatusDot) pgStatusDot.classList.toggle('active', isActive);
    if (pgMetaChars && pgStage) {
      pgMetaChars.textContent = `${pgStage.textContent?.length || 0} chars`;
    }
  };

  const updateStageStyles = () => {
    if (!pgStage) return;
    const size = pgFontSize?.value ? `${pgFontSize.value}px` : '24px';
    const font = pgFontFamily?.value || 'Inter';
    const align = pgTextAlign?.value || 'left';

    pgStage.style.fontSize = size;
    pgStage.style.fontFamily = `"${font}", var(--tf-font-sans)`;
    pgStage.style.textAlign = align;

    if (pgMetaFont) pgMetaFont.textContent = `${size} · ${font}`;
  };

  const getOptions = () => {
    const opts = {
      speed: Number(pgSpeed?.value ?? 40),
      delay: Number(pgDelay?.value ?? 0),
      speedVariance: Number(pgSpeedVariance?.value ?? 0),
      direction: pgDirection?.value || 'left',
      typeStyle: pgTypeStyle?.value || 'char',
      eraseStyle: pgEraseStyle?.value || 'end',
      cursor: pgCursorChar?.value ?? '|',
      cursorBlink: pgCursorBlink?.checked ?? true,
      granularity: pgGranularity?.value || 'grapheme',
      mode: pgMode?.value || 'replace',
      html: pgHtml?.checked ?? true,
      naturalCadence: pgNaturalCadence?.checked ?? false,
      respectReducedMotion: pgReducedMotion?.checked ?? false,
    };

    if (pgTypeStyle?.value === 'scramble' || pgEraseStyle?.value === 'scramble') {
      opts.scrambleCharset = pgScrambleCharset?.value || 'matrix';
      opts.scrambleRounds = Number(pgScrambleRounds?.value ?? 2);
      const colorVal = pgScrambleColor?.value;
      if (colorVal && colorVal !== 'default') {
        if (colorVal === 'cyber-gradient') {
          opts.scrambleGradient = 'linear-gradient(135deg, #38bdf8 0%, #fb923c 100%)';
        } else if (colorVal === 'matrix-gradient') {
          opts.scrambleGradient = 'linear-gradient(135deg, #22c55e 0%, #38bdf8 100%)';
        } else if (colorVal === 'sunset-gradient') {
          opts.scrambleGradient = 'linear-gradient(135deg, #fb923c 0%, #f43f5e 100%)';
        } else {
          opts.scrambleColor = colorVal;
        }
      }
    }

    if (pgTypeStyle?.value === 'fade-trail' || pgEraseStyle?.value === 'fade-trail') {
      const len = Number(pgFadeTrailLen?.value ?? 4);
      const minOp = Number(pgFadeTrailMinOp?.value ?? 0.18);
      opts.trailingFadeLength = len;
      opts.trailFade = len;
      opts.trailingFadeMinOpacity = minOp;
      opts.trailMinOpacity = minOp;
    }

    if (pgStagger && Number(pgStagger.value) > 0) {
      opts.stagger = Number(pgStagger.value);
    }

    if (pgEraseStyle?.value === 'fade') {
      opts.duration = Number(pgFadeDuration?.value ?? 250);
    }

    if (pgAudio?.value && pgAudio.value !== 'none') {
      opts.audio = pgAudio.value;
    }

    return opts;
  };

  const updateCodeSnippet = () => {
    if (!pgCodeSnippet) return;
    const opts = getOptions();
    const cleanOpts = { ...opts };
    if (!cleanOpts.speedVariance) delete cleanOpts.speedVariance;
    if (!cleanOpts.delay) delete cleanOpts.delay;
    if (!cleanOpts.stagger) delete cleanOpts.stagger;
    if (cleanOpts.direction === 'left') delete cleanOpts.direction;
    if (cleanOpts.typeStyle === 'char') delete cleanOpts.typeStyle;
    if (cleanOpts.eraseStyle === 'end') delete cleanOpts.eraseStyle;
    if (cleanOpts.cursor === '|') delete cleanOpts.cursor;
    if (cleanOpts.cursorBlink === true) delete cleanOpts.cursorBlink;
    if (cleanOpts.granularity === 'grapheme') delete cleanOpts.granularity;
    if (cleanOpts.mode === 'replace') delete cleanOpts.mode;
    if (cleanOpts.html === true) delete cleanOpts.html;
    if (!cleanOpts.naturalCadence) delete cleanOpts.naturalCadence;
    if (!cleanOpts.respectReducedMotion) delete cleanOpts.respectReducedMotion;

    const formatted = JSON.stringify(cleanOpts, null, 2);
    pgCodeSnippet.textContent = `import { TypeFlow } from '@staticcanvas/typeflow';\n\nconst controller = TypeFlow.type(\n  '#target',\n  ${JSON.stringify(pgText.value)},\n  ${formatted}\n);`;
  };

  // Slider Badges Listeners
  const bindSlider = (input, badge, suffix = ' ms') => {
    if (!input || !badge) return;
    input.addEventListener('input', () => {
      badge.textContent = `${input.value}${suffix}`;
      updateCodeSnippet();
      updateStageStyles();
    });
  };

  bindSlider(pgSpeed, pgSpeedVal, ' ms');
  bindSlider(pgSpeedVariance, pgSpeedVarianceVal, ' ms');
  bindSlider(pgDelay, pgDelayVal, ' ms');
  bindSlider(pgStagger, pgStaggerVal, ' ms');
  bindSlider(pgFadeDuration, pgFadeDurationVal, ' ms');
  bindSlider(pgScrambleRounds, pgScrambleRoundsVal, '');
  bindSlider(pgFadeTrailLen, pgFadeTrailLenVal, ' chars');
  bindSlider(pgFadeTrailMinOp, pgFadeTrailMinOpVal, '');
  bindSlider(pgFontSize, pgFontSizeVal, ' px');

  // Input Changes
  [
    pgPresetSelect,
    pgSampleSelect,
    pgText,
    pgDirection,
    pgTypeStyle,
    pgScrambleCharset,
    pgScrambleColor,
    pgEraseStyle,
    pgAudio,
    pgFontFamily,
    pgTextAlign,
    pgCursorChar,
    pgGranularity,
    pgMode,
    pgHtml,
    pgNaturalCadence,
    pgCursorBlink,
    pgReducedMotion,
  ].forEach((el) => {
    el?.addEventListener('change', () => {
      updateStageStyles();
      updateCodeSnippet();
    });
  });

  pgText?.addEventListener('input', () => {
    updateCodeSnippet();
  });

  // Preset Switcher
  pgPresetSelect?.addEventListener('change', () => {
    const val = pgPresetSelect.value;
    if (val === 'cyberpunk') {
      if (pgTypeStyle) pgTypeStyle.value = 'scramble';
      if (pgScrambleCharset) pgScrambleCharset.value = 'matrix';
      if (pgEraseStyle) pgEraseStyle.value = 'scramble';
      if (pgAudio) pgAudio.value = 'synth';
      if (pgSpeed) { pgSpeed.value = '35'; if (pgSpeedVal) pgSpeedVal.textContent = '35 ms'; }
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'terminal') {
      if (pgTypeStyle) pgTypeStyle.value = 'char';
      if (pgEraseStyle) pgEraseStyle.value = 'end';
      if (pgAudio) pgAudio.value = 'mechanical';
      if (pgCursorChar) pgCursorChar.value = '▍';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'writer') {
      if (pgTypeStyle) pgTypeStyle.value = 'char';
      if (pgNaturalCadence) pgNaturalCadence.checked = true;
      if (pgSpeedVariance) { pgSpeedVariance.value = '20'; if (pgSpeedVarianceVal) pgSpeedVarianceVal.textContent = '20 ms'; }
      if (pgAudio) pgAudio.value = 'mechanical';
      if (pgFontFamily) pgFontFamily.value = 'Inter';
    } else if (val === 'blocks') {
      if (pgTypeStyle) pgTypeStyle.value = 'scramble';
      if (pgScrambleCharset) pgScrambleCharset.value = 'blocks';
      if (pgEraseStyle) pgEraseStyle.value = 'scramble';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'subtle') {
      if (pgTypeStyle) pgTypeStyle.value = 'char';
      if (pgEraseStyle) pgEraseStyle.value = 'fade';
      if (pgAudio) pgAudio.value = 'none';
      if (pgFadeDuration) { pgFadeDuration.value = '400'; if (pgFadeDurationVal) pgFadeDurationVal.textContent = '400 ms'; }
    }
    updateStageStyles();
    updateCodeSnippet();
  });

  // Sample Switcher
  pgSampleSelect?.addEventListener('change', () => {
    const val = pgSampleSelect.value;
    if (val === 'headline') {
      pgText.value = 'Build modern resilient interfaces with TypeFlow.';
    } else if (val === 'html') {
      pgText.value = 'Deploy to <strong>Production</strong> with <span class="highlight">Zero Downtime</span>.';
    } else if (val === 'cyber') {
      pgText.value = 'SYSTEM BREACH DETECTED // INITIALIZING COUNTERMEASURES';
    } else if (val === 'code') {
      pgText.value = 'const session = await TypeFlow.stream(target, { speed: 20 });';
    }
    updateCodeSnippet();
  });

  // Action: Type
  btnType.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    setStatus('Typing...', true);
    updateStageStyles();

    const opts = getOptions();
    opts.onComplete = (text) => {
      setStatus('Complete', false);
    };
    opts.onInterrupt = () => {
      setStatus('Interrupted', false);
    };

    activeController = TypeFlow.type(pgStage, pgText.value, opts);
  });

  // Action: Erase
  btnErase?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    setStatus('Erasing...', true);

    const opts = getOptions();
    opts.onComplete = () => {
      setStatus('Erased', false);
    };
    opts.onInterrupt = () => {
      setStatus('Interrupted', false);
    };

    activeController = TypeFlow.erase(pgStage, opts);
  });

  // Action: Morph
  let morphIndex = 0;
  const morphPhrases = [
    'TypeFlow is lightweight and fast.',
    'TypeFlow is robust and resilient.',
    'TypeFlow is modern and interactive.'
  ];
  btnMorph?.addEventListener('click', async () => {
    activeController?.stop();
    activeStream?.stop();
    setStatus('Morphing...', true);
    updateStageStyles();

    morphIndex = (morphIndex + 1) % morphPhrases.length;
    const nextPhrase = morphPhrases[morphIndex];
    const opts = getOptions();

    activeController = TypeFlow.morph(pgStage, nextPhrase, {
      ...opts,
      onComplete: () => setStatus('Morphed', false),
    });
  });

  // Action: Stream
  btnStream?.addEventListener('click', async () => {
    activeController?.stop();
    activeStream?.stop();
    pgStage.textContent = '';
    setStatus('Streaming LLM Tokens...', true);
    updateStageStyles();

    const stream = TypeFlow.stream(pgStage, {
      ...getOptions(),
      onChunk: (chunk) => {
        setStatus(`Streaming... (${pgStage.textContent.length} chars)`, true);
      },
      onComplete: () => {
        setStatus('Stream finished', false);
      },
    });
    activeStream = stream;

    const chunks = [
      'TypeFlow Stream Ingestion: ',
      'tokens arrive asynchronously ',
      'from server-sent events (SSE) ',
      'and render fluidly ',
      'with zero DOM lag!'
    ];

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 100 : 350));
      stream.push(chunks[i]);
    }
  });

  // Action: Rotate
  btnRotator?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    setStatus('Rotating...', true);
    updateStageStyles();

    const words = [
      'Declarative animations.',
      'Interruptible promises.',
      'Pure ECMAScript zero dependencies.',
      'Procedural Web Audio clicks.'
    ];

    activeController = TypeFlow.rotate(pgStage, words, {
      typeConfig:  getOptions(),
      eraseConfig: getOptions(),
      holdDuration: 1400,
      pauseBetween: 250,
      repeat: 3
    });
  });

  // Action: Stop
  btnStop?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    TypeFlow.stop(pgStage);
    setStatus('Stopped', false);
  });

  // Action: Reset
  btnReset?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    if (pgPresetSelect) pgPresetSelect.value = 'custom';
    if (pgSampleSelect) pgSampleSelect.value = 'headline';
    if (pgText) pgText.value = 'Build modern resilient interfaces with TypeFlow.';
    if (pgDirection) pgDirection.value = 'left';
    if (pgTypeStyle) pgTypeStyle.value = 'char';
    if (pgEraseStyle) pgEraseStyle.value = 'end';
    if (pgSpeed) { pgSpeed.value = '40'; if (pgSpeedVal) pgSpeedVal.textContent = '40 ms'; }
    if (pgSpeedVariance) { pgSpeedVariance.value = '0'; if (pgSpeedVarianceVal) pgSpeedVarianceVal.textContent = '0 ms'; }
    if (pgDelay) { pgDelay.value = '0'; if (pgDelayVal) pgDelayVal.textContent = '0 ms'; }
    if (pgFontSize) { pgFontSize.value = '24'; if (pgFontSizeVal) pgFontSizeVal.textContent = '24 px'; }
    if (pgFontFamily) pgFontFamily.value = 'Inter';
    if (pgTextAlign) pgTextAlign.value = 'left';
    if (pgAudio) pgAudio.value = 'none';

    updateStageStyles();
    updateCodeSnippet();
    setStatus('Reset', false);
  });

  // Action: Clear
  btnClear?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    pgStage.replaceChildren();
    setStatus('Cleared', false);
  });

  // Action: Copy Code
  btnCopyCode?.addEventListener('click', async () => {
    if (!pgCodeSnippet) return;
    try {
      await navigator.clipboard.writeText(pgCodeSnippet.textContent);
      const prevHtml = btnCopyCode.innerHTML;
      btnCopyCode.innerHTML = '<i data-lucide="check"></i> Copied!';
      initIcons();
      setTimeout(() => {
        btnCopyCode.innerHTML = prevHtml;
        initIcons();
      }, 1500);
    } catch {}
  });

  // ── Metrics HUD Switch ──
  const setMetricsActive = (active) => {
    if (pgMetricsToggle) pgMetricsToggle.checked = active;
    if (btnMetrics) {
      btnMetrics.classList.toggle('button-primary', active);
      btnMetrics.classList.toggle('button-ghost', !active);
    }
    if (active) {
      TypeFlowMetrics.mount({ position: 'bottom-right', detailed: false });
    } else {
      TypeFlowMetrics.unmount();
    }
  };

  pgMetricsToggle?.addEventListener('change', () => {
    setMetricsActive(pgMetricsToggle.checked);
  });

  btnMetrics?.addEventListener('click', () => {
    const next = !pgMetricsToggle?.checked;
    setMetricsActive(next);
  });

  // ── Debug Tracing Switch ──
  const setDebugActive = (active) => {
    if (pgDebugToggle) pgDebugToggle.checked = active;
    if (btnDebug) {
      btnDebug.classList.toggle('button-primary', active);
      btnDebug.classList.toggle('button-ghost', !active);
    }
    if (active) {
      TypeFlowDebug.enable({ logcad: true, console: true });
    } else {
      TypeFlowDebug.disable();
    }
  };

  pgDebugToggle?.addEventListener('change', () => {
    setDebugActive(pgDebugToggle.checked);
  });

  btnDebug?.addEventListener('click', () => {
    const next = !pgDebugToggle?.checked;
    setDebugActive(next);
  });

  // Initial load execution
  updateStageStyles();
  updateCodeSnippet();
  activeController = TypeFlow.type(pgStage, pgText.value, getOptions());
}

// ─── Client-Side Search Engine & Two-Column Modal ─────────────────────────────

/**
 * @typedef {Object} SearchDocItem
 * @property {string} title - Page or section title.
 * @property {string} [heading] - Heading title if this is a sub-section anchor.
 * @property {string} [anchor] - Anchor hash string (e.g., '#procedural-web-audio').
 * @property {string} permalink - Target relative or absolute URL.
 * @property {string} description - Excerpt or summary.
 * @property {string} category - Category name ('Guides', 'Reference', 'Tools', 'Extensions', etc.).
 * @property {string[]} keywords - Associated search keywords.
 * @property {string} content - Full searchable text content.
 * @property {boolean} isAnchor - True if this entry represents a sub-heading anchor.
 */

const normalizeUrl = (url) => {
  if (!url) return '#';
  return url;
};

/**
 * Generates an anchor slug from a heading text matching Hugo Goldmark anchors.
 * @param {string} text
 * @returns {string}
 */
const slugifyHeading = (text) => {
  return String(text || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '') // remove html tags
    .replace(/[^\w\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with hyphens
};

/**
 * Escapes regex special characters.
 * @param {string} str
 * @returns {string}
 */
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Highlights matched query keywords in text.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
const highlightMatches = (text, query) => {
  if (!text || !query) return text || '';
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return String(text).replace(pattern, '<mark class="search-match">$1</mark>');
};

const searchModalInput   = document.getElementById('search-modal-input');
const searchResultsList  = document.getElementById('search-results-list');
const searchPreviewPane  = document.getElementById('search-preview-pane');
const searchModalCounter = document.getElementById('search-modal-counter');
const searchFilterPills  = document.querySelectorAll('#search-modal-filters .search-filter-pill');

if (searchModalInput && searchResultsList && searchPreviewPane) {
  /** @type {SearchDocItem[]} */
  let searchIndex = [];
  let currentFilter = 'all';
  let currentMatches = [];
  let selectedIndex = -1;

  /**
   * Parses raw Hugo index JSON into structured page & section anchor entries.
   * @param {Array<Object>} rawData
   * @returns {SearchDocItem[]}
   */
  const buildIndex = (rawData) => {
    const items = [];

    rawData.forEach((doc) => {
      const pageTitle = doc.title || 'Untitled';
      const pageUrl   = doc.permalink || '#';
      const category  = doc.category || 'General';
      const keywords  = Array.isArray(doc.keywords) ? doc.keywords : (doc.keywords ? String(doc.keywords).split(/,\s*/) : []);
      const pageDesc  = doc.description || '';
      const pageText  = doc.content || '';
      const rawText   = doc.raw || '';

      // 1. Add root page entry
      items.push({
        title: pageTitle,
        permalink: pageUrl,
        description: pageDesc || pageText.slice(0, 160),
        category,
        keywords,
        content: pageText,
        isAnchor: false,
      });

      // 2. Parse Headings (## and ###) from raw markdown
      if (rawText) {
        const lines = rawText.split('\n');
        let currentHeading = null;
        let currentSlug = null;
        let currentSectionLines = [];

        const flushSection = () => {
          if (currentHeading && currentSlug) {
            const sectionContent = currentSectionLines.join(' ').replace(/<[^>]+>/g, '').trim();
            if (sectionContent.length > 10 || currentHeading.length > 3) {
              const headingWords = currentHeading.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
              items.push({
                title: pageTitle,
                heading: currentHeading,
                anchor: `#${currentSlug}`,
                permalink: `${pageUrl}#${currentSlug}`,
                description: sectionContent.slice(0, 160) || pageDesc,
                category,
                keywords: [...keywords, ...headingWords],
                content: `${currentHeading} ${sectionContent}`,
                isAnchor: true,
              });
            }
          }
          currentSectionLines = [];
        };

        for (const line of lines) {
          const match = line.match(/^#{2,3}\s+(.+)$/);
          if (match) {
            flushSection();
            const rawHeading = match[1].replace(/`([^`]+)`/g, '$1').replace(/\(.*\)/g, '').trim();
            currentHeading = rawHeading;
            currentSlug = slugifyHeading(rawHeading);
          } else if (currentHeading) {
            if (line.trim()) {
              currentSectionLines.push(line.trim());
            }
          }
        }
        flushSection();
      }
    });

    return items;
  };

  /**
   * Lazily loads and parses search index JSON.
   */
  const loadSearchIndex = async () => {
    if (searchIndex.length > 0) return;

    const urlsToTry = [
      document.body.dataset.searchIndex,
      'index.json',
      '../index.json',
      '/typeflow/index.json',
      '/index.json',
    ].filter(Boolean);

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw) && raw.length > 0) {
            searchIndex = buildIndex(raw);
            break;
          }
        }
      } catch {}
    }
  };

  /**
   * Converts markdown formatting (code blocks, inline code, bold, italic, quotes, lists)
   * into clean HTML for search preview typography.
   * @param {string} md
   * @param {string} [query='']
   * @returns {string}
   */
  const formatMarkdownSnippet = (md, query = '') => {
    if (!md) return '';

    // 1. Escape HTML special characters
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Fenced code blocks ```lang ... ```
    html = html.replace(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_m, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // 3. Inline code `code`
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 4. Bold **bold** or __bold__
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // 5. Italic *italic* or _italic_
    html = html.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    html = html.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');

    // 6. Blockquotes > quote
    html = html.replace(/^&gt;\s*(.+)$/gm, '<blockquote>$1</blockquote>');

    // 7. Markdown lists - item or * item
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');

    // 8. Paragraphs: split by double newlines if not inside pre/ul/blockquote
    const blocks = html.split(/\n\n+/);
    html = blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<pre>') || trimmed.startsWith('<ul>') || trimmed.startsWith('<blockquote>')) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('');

    // 9. Highlight matching query terms (avoid modifying inside tag attributes)
    if (query && query.trim().length > 1) {
      const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = html.split(/(<[^>]+>)/g);
      html = parts.map((part) => {
        if (part.startsWith('<') && part.endsWith('>')) return part;
        return part.replace(new RegExp(`(${q})`, 'gi'), '<mark class="search-match">$1</mark>');
      }).join('');
    }

    return html;
  };

  let previewTitleController = null;
  let previewContentController = null;
  let currentPreviewKey = null;

  /**
   * Updates live preview pane with rich details, anchor links, and animated TypeFlow typography.
   * @param {SearchDocItem | null} item
   * @param {string} query
   */
  const updatePreview = (item, query = '') => {
    const itemKey = item ? (item.permalink + (item.anchor || '')) : 'empty';
    if (currentPreviewKey === itemKey) return;
    currentPreviewKey = itemKey;

    // 1. Stop any in-flight TypeFlow animation controllers
    previewTitleController?.stop();
    previewContentController?.stop();

    if (!item) {
      searchPreviewPane.innerHTML = `
        <div class="search-preview-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p id="search-preview-empty-hint"></p>
        </div>
      `;
      const hintEl = document.getElementById('search-preview-empty-hint');
      if (hintEl) {
        TypeFlow.type(hintEl, 'Select any document or section to inspect live preview...', {
          speed: 2,
          respectReducedMotion: false,
        });
      }
      return;
    }

    const rawTitle = item.heading || item.title;
    const targetUrl = normalizeUrl(item.permalink);
    const rawSnippet = item.content
      ? (item.content.length > 320 ? item.content.slice(0, 320) + '...' : item.content)
      : item.description;

    const formattedSnippet = formatMarkdownSnippet(rawSnippet, query);

    searchPreviewPane.innerHTML = `
      <div class="search-preview-header">
        <span class="search-preview-meta">${item.category}</span>
        ${item.isAnchor ? `<span class="search-anchor-badge">${item.anchor}</span>` : ''}
      </div>
      <h3 class="search-preview-title" id="search-preview-title-el"></h3>
      ${item.isAnchor ? `<div class="search-preview-section"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Document: ${item.title}</div>` : ''}
      <div class="search-preview-content" id="search-preview-content-el"></div>
      <div class="search-preview-actions">
        <a class="search-jump-btn" href="${targetUrl}">
          ${item.isAnchor ? 'Jump to section ↗' : 'Open page ↗'}
        </a>
      </div>
    `;

    const titleEl = document.getElementById('search-preview-title-el');
    const contentEl = document.getElementById('search-preview-content-el');

    // 2. Showcase TypeFlow in real-time search preview!
    if (titleEl) {
      previewTitleController = TypeFlow.type(titleEl, rawTitle, {
        typeStyle: item.isAnchor ? 'scramble' : 'char',
        scrambleCharset: 'cyber',
        scrambleRounds: 1,
        speed: 2,
        cursor: '|',
        cursorBlink: false,
        respectReducedMotion: false,
      });
    }

    if (contentEl) {
      previewContentController = TypeFlow.type(contentEl, formattedSnippet, {
        html: true,
        allowedTags: ['pre', 'code', 'strong', 'em', 'blockquote', 'p', 'ul', 'ol', 'li', 'mark', 'a', 'kbd', 'span', 'b', 'i', 'br'],
        speed: 2,
        cursor: '',
        naturalCadence: false,
        respectReducedMotion: false,
      });
    }
  };

  /**
   * Renders filtered & ranked search results.
   */
  const executeSearch = () => {
    const query = searchModalInput.value.trim().toLowerCase();

    // 1. Filter by category
    let pool = searchIndex;
    if (currentFilter !== 'all') {
      pool = pool.filter((it) => it.category.toLowerCase() === currentFilter.toLowerCase());
    }

    if (!query) {
      currentMatches = pool.slice(0, 10);
      selectedIndex = currentMatches.length ? 0 : -1;
      renderMatchList(query);
      if (searchModalCounter) {
        searchModalCounter.textContent = `${pool.length} total entries available`;
      }
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);

    // 2. Score items
    const scored = pool
      .map((item) => {
        const titleLower   = (item.title || '').toLowerCase();
        const headingLower = (item.heading || '').toLowerCase();
        const descLower    = (item.description || '').toLowerCase();
        const bodyLower    = (item.content || '').toLowerCase();
        const catLower     = (item.category || '').toLowerCase();
        const kwList       = item.keywords.map((k) => String(k).toLowerCase());

        let score = 0;
        for (const t of terms) {
          // Exact heading / title matches get maximum score
          if (headingLower === t) score += 180;
          else if (headingLower.startsWith(t)) score += 90;
          else if (headingLower.includes(t)) score += 55;

          if (titleLower === t) score += 140;
          else if (titleLower.startsWith(t)) score += 70;
          else if (titleLower.includes(t)) score += 40;

          // Keyword bonus
          if (kwList.some((k) => k === t)) score += 80;
          else if (kwList.some((k) => k.includes(t))) score += 40;

          // Category match
          if (catLower.includes(t)) score += 30;

          // Description and body content matches
          if (descLower.includes(t)) score += 20;
          if (bodyLower.includes(t)) score += 8;
        }

        return { item, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 18)
      .map((m) => m.item);

    currentMatches = scored;
    selectedIndex = currentMatches.length ? 0 : -1;
    renderMatchList(query);

    if (searchModalCounter) {
      searchModalCounter.textContent = `${currentMatches.length} matching results`;
    }
  };

  /**
   * Renders the HTML for the left column list.
   * @param {string} query
   */
  const renderMatchList = (query) => {
    if (!currentMatches.length) {
      searchResultsList.innerHTML = `
        <div class="search-empty">
          <span>No documents or sections found matching "<strong>${escapeRegExp(query)}</strong>"</span>
        </div>
      `;
      updatePreview(null);
      return;
    }

    searchResultsList.innerHTML = currentMatches.map((m, idx) => {
      const isSelected = idx === selectedIndex;
      const hlTitle = highlightMatches(m.title, query);
      const hlHeading = m.heading ? highlightMatches(m.heading, query) : null;
      const displayTitle = hlHeading || hlTitle;
      const snippet = m.description || (m.content ? m.content.slice(0, 100) : '');
      const hlSnippet = highlightMatches(snippet, query);
      const targetUrl = normalizeUrl(m.permalink);

      return `
        <a class="search-result-item ${isSelected ? 'is-selected' : ''}" href="${targetUrl}" data-index="${idx}" role="option" aria-selected="${isSelected}">
          <div class="search-result-header">
            <span class="search-result-title">
              ${m.isAnchor ? `<span class="search-anchor-badge">§</span>` : ''}
              ${displayTitle}
            </span>
            <span class="search-category-badge">${m.category}</span>
          </div>
          <div class="search-result-desc">${hlSnippet}</div>
        </a>
      `;
    }).join('');

    // Update initial preview
    if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
      updatePreview(currentMatches[selectedIndex], query);
    }

    // Attach hover listeners for live preview update
    searchResultsList.querySelectorAll('.search-result-item').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const idx = Number(el.dataset.index);
        setSelection(idx, false);
      });
    });
  };

  /**
   * Sets the visual selection index and synchronizes preview pane.
   * @param {number} idx
   * @param {boolean} [scrollIntoView=true]
   */
  const setSelection = (idx, scrollIntoView = true) => {
    if (idx < 0 || idx >= currentMatches.length) return;
    selectedIndex = idx;

    const items = searchResultsList.querySelectorAll('.search-result-item');
    items.forEach((it, i) => {
      const isSel = i === selectedIndex;
      it.classList.toggle('is-selected', isSel);
      it.setAttribute('aria-selected', String(isSel));
      if (isSel && scrollIntoView) {
        it.scrollIntoView({ block: 'nearest' });
      }
    });

    const query = searchModalInput.value.trim().toLowerCase();
    updatePreview(currentMatches[selectedIndex], query);
  };

  // ── Input & Filter Listeners ──

  searchModalInput.addEventListener('focus', async () => {
    await loadSearchIndex();
    executeSearch();
  });

  searchModalInput.addEventListener('input', async () => {
    await loadSearchIndex();
    executeSearch();
  });

  searchModalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        const next = selectedIndex < currentMatches.length - 1 ? selectedIndex + 1 : 0;
        setSelection(next, true);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        const prev = selectedIndex > 0 ? selectedIndex - 1 : currentMatches.length - 1;
        setSelection(prev, true);
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
        e.preventDefault();
        window.location.href = normalizeUrl(currentMatches[selectedIndex].permalink);
      }
    }
  });

  searchFilterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      searchFilterPills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentFilter = pill.dataset.filter || 'all';
      executeSearch();
      searchModalInput.focus();
    });
  });

  // Preload index on idle
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => loadSearchIndex());
  } else {
    setTimeout(loadSearchIndex, 800);
  }
}

// ─── TOC Active Section Highlighting ─────────────────────────────────────────

const tocLinks = document.querySelectorAll('.doc-toc nav a');
if (tocLinks.length) {
  const headings = [...document.querySelectorAll('.doc-content h2, .doc-content h3')];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocLinks.forEach((a) => a.classList.remove('toc-active'));
        const active = [...tocLinks].find((a) => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  headings.forEach((h) => observer.observe(h));
}



