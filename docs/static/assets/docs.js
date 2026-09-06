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

// Carry the entry module's content token into companion imports so a docs
// deployment cannot combine a fresh slogan schema with stale runtime modules.
const assetVersion = new URL(import.meta.url).search;
const [
  { TypeFlow, seq },
  { TypeFlowMetrics },
  { TypeFlowDebug },
] = await Promise.all([
  import(`../webutil/libs/typeflow.esm.js${assetVersion}`),
  import(`../webutil/libs/typeflow-metrics.esm.js${assetVersion}`),
  import(`../webutil/libs/typeflow-debug.esm.js${assetVersion}`),
]);

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

const MERMAID_MODULE_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs';
let mermaidModulePromise;
let mermaidRenderSequence = 0;
const mermaidSources = new WeakMap();

/**
 * Loads Mermaid only when a diagram is present. The exact version is pinned so
 * documentation builds do not silently acquire a different renderer.
 * @returns {Promise<object|null>}
 */
async function loadMermaid() {
  if (!document.querySelector('pre code.language-mermaid, div.mermaid, .mermaid-diagram')) return null;
  mermaidModulePromise ||= import(MERMAID_MODULE_URL).then((module) => module.default || module);

  try {
    return await mermaidModulePromise;
  } catch (error) {
    console.error('TypeFlow docs: Mermaid could not be loaded.', error);
    return null;
  }
}

/**
 * Builds a Mermaid theme variables object matched to the TypeFlow docs palette.
 * @param {'dark'|'light'} theme
 * @returns {object} Mermaid themeVariables config
 */
function getMermaidThemeVars(theme) {
  const styles = getComputedStyle(root);
  const token = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  const canvas = token('--tf-bg-canvas', theme === 'light' ? '#f8fafc' : '#090d16');
  const surface = token('--tf-bg-surface', theme === 'light' ? '#ffffff' : '#0f172a');
  const elevated = token('--tf-bg-surface-elevated', theme === 'light' ? '#f1f5f9' : '#1e293b');
  const border = token('--tf-border-default', theme === 'light' ? '#cbd5e1' : '#253347');
  const strongBorder = token('--tf-border-strong', theme === 'light' ? '#94a3b8' : '#334155');
  const text = token('--tf-text-primary', theme === 'light' ? '#0f172a' : '#f1f5f9');
  const secondaryText = token('--tf-text-secondary', theme === 'light' ? '#475569' : '#a8b4c5');
  const accent = token('--tf-accent', theme === 'light' ? '#0284c7' : '#38bdf8');
  const orange = token('--tf-nav-active', theme === 'light' ? '#c2410c' : '#ffb07c');
  const mono = token('--tf-font-mono', 'ui-monospace, monospace');

  return {
    background: canvas,
    mainBkg: surface,
    nodeBorder: border,
    clusterBkg: elevated,
    titleColor: text,
    edgeLabelBackground: elevated,
    nodeTextColor: text,
    textColor: secondaryText,
    labelTextColor: text,
    primaryColor: surface,
    primaryBorderColor: accent,
    primaryTextColor: text,
    secondaryColor: elevated,
    secondaryBorderColor: orange,
    secondaryTextColor: orange,
    tertiaryColor: canvas,
    tertiaryBorderColor: strongBorder,
    tertiaryTextColor: secondaryText,
    lineColor: strongBorder,
    activationBorderColor: accent,
    activationBkgColor: elevated,
    actorBkg: surface,
    actorBorder: border,
    actorTextColor: text,
    actorLineColor: strongBorder,
    signalColor: secondaryText,
    signalTextColor: text,
    noteBkgColor: elevated,
    noteBorderColor: border,
    noteTextColor: secondaryText,
    fontFamily: mono,
    fontSize: '13px',
  };
}

/**
 * Initialises (or re-initialises) Mermaid with the current theme.
 * Processes any `.language-mermaid` code blocks Hugo emits and wraps
 * them in a `.mermaid-diagram` container with toolbar controls.
 * @param {'dark'|'light'} [theme]
 */
async function initMermaid(theme) {
  const mermaid = await loadMermaid();
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

  // Hugo renders ```mermaid as <pre><code class="language-mermaid">. Keep the
  // original block in place until Mermaid has loaded, which is the no-JS and
  // network-failure fallback.
  const codeBlocks = document.querySelectorAll('pre code.language-mermaid');

  for (const code of codeBlocks) {
    const pre = code.closest('pre');
    if (!pre) continue;

    const definition = code.textContent.trim();
    const wrapper = document.createElement('figure');
    wrapper.className = 'mermaid-diagram';
    wrapper.setAttribute('aria-label', 'TypeFlow architecture diagram');
    wrapper.innerHTML = `
      <div class="mermaid-toolbar">
        <span class="mermaid-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="m9 9 3 3 3-3"/><path d="M12 12v6"/></svg> Diagram</span>
        <button type="button" class="mermaid-copy-btn" aria-label="Copy Mermaid source"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
      </div>
      <div class="mermaid-render" id="mermaid-${++mermaidRenderSequence}" role="img" aria-label="Rendered Mermaid diagram" tabindex="0"></div>
      <details class="mermaid-source">
        <summary>View diagram source</summary>
        <pre><code></code></pre>
      </details>
    `;

    wrapper.querySelector('.mermaid-source code').textContent = definition;
    mermaidSources.set(wrapper, definition);
    pre.replaceWith(wrapper);

    const copyBtn = wrapper.querySelector('.mermaid-copy-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(definition);
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`; }, 1800);
      } catch {}
    });
  }

  // Re-render existing wrappers on every theme change using the retained source.
  for (const wrapper of document.querySelectorAll('.mermaid-diagram')) {
    const renderTarget = wrapper.querySelector('.mermaid-render');
    const definition = mermaidSources.get(wrapper);
    if (!renderTarget || !definition) continue;

    try {
      // Mermaid's own render() looks up this id in the live document and
      // deletes any element it finds there as internal bookkeeping, so the
      // id passed here must never match a permanent element (the render
      // target keeps its own id from creation and is never touched).
      const renderId = `mermaid-render-pass-${++mermaidRenderSequence}`;
      const { svg, bindFunctions } = await mermaid.render(renderId, definition);
      renderTarget.innerHTML = svg;
      bindFunctions?.(renderTarget);
      const svgEl = renderTarget.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }
    } catch (error) {
      renderTarget.replaceChildren();
      const failure = document.createElement('pre');
      failure.className = 'mermaid-error';
      failure.textContent = `Diagram parse error:\n${error instanceof Error ? error.message : String(error)}`;
      renderTarget.append(failure);
    }
  }

  // Raw Mermaid containers are supported for shortcodes. Their source remains
  // in the element until Mermaid replaces it, so they retain a non-JS fallback.
  const rawDivs = [...document.querySelectorAll('div.mermaid:not([data-mermaid-processed])')];
  if (rawDivs.length > 0) {
    rawDivs.forEach((element) => { element.dataset.mermaidProcessed = 'true'; });
    await mermaid.run({ nodes: rawDivs });
  }
}

initMermaid();

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
      if (isCurrent) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });

    document.startViewTransition(() => {
      window.location.assign(href);
    });
  });
}

// ─── Keyboard Search Shortcut & Modal Triggers ───────────────────────────────

let searchReturnFocus = null;

/**
 * Opens the 2-column search popup modal.
 */
export const openSearchModal = () => {
  const modal = document.getElementById('typeflow-search-modal');
  const input = document.getElementById('search-modal-input');
  if (modal) {
    searchReturnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : document.querySelector('[data-search-trigger]');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('[data-search-trigger]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'true');
    });
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
  if (modal && !modal.hasAttribute('hidden')) {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    document.querySelectorAll('[data-search-trigger]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });
    searchReturnFocus?.focus();
    searchReturnFocus = null;
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
  if (pre.classList.contains('pg-code-pre') || pre.closest('.pg-code-card') || pre.querySelector('.copy-button')) return;

  // Code blocks can overflow horizontally, so they must be keyboard-focusable
  // for users who cannot drag a scrollbar or use a precision pointer.
  if (!pre.hasAttribute('tabindex')) pre.tabIndex = 0;

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
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroSloganEl) {
  const setMode = (label) => {
    if (heroModeText) {
      heroModeText.textContent = label;
    }
  };

  let sloganSteps = [];
  let staticSlogan = null;
  const slogansDataEl = document.getElementById('splash-slogans-data');
  if (slogansDataEl) {
    try {
      const parsedSlogans = JSON.parse(slogansDataEl.textContent);
      if (Array.isArray(parsedSlogans) && parsedSlogans.length > 0) {
        staticSlogan = parsedSlogans[0];
        parsedSlogans.forEach((item) => {
          const {
            slogan,
            mode,
            typeStyle = 'char',
            eraseStyle = 'end',
            speed = 45,
            cursor = '|',
            typeConfig = {},
            eraseConfig = {},
            ...sharedOptions
          } = item;
          const typeOptions = { ...sharedOptions, ...typeConfig };
          const eraseOptions = { ...sharedOptions, ...eraseConfig };
          sloganSteps.push(
            seq.call(() => setMode(mode || slogan)),
            seq.type(heroSloganEl, slogan, {
              ...typeOptions,
              typeStyle: typeOptions.typeStyle ?? typeStyle,
              speed: typeOptions.speed ?? speed,
              cursor: typeOptions.cursor ?? cursor,
              cursorBlink: typeOptions.cursorBlink ?? true,
              respectReducedMotion: typeOptions.respectReducedMotion ?? false,
            }),
            seq.pause(2600),
            seq.erase(heroSloganEl, {
              ...eraseOptions,
              eraseStyle: eraseOptions.eraseStyle ?? eraseStyle,
              scrambleRounds: eraseConfig.scrambleRounds ?? 1,
              speed: eraseConfig.speed ?? Math.max(16, Math.floor(speed * 0.55)),
              duration: eraseOptions.duration ?? 350,
              cursor: eraseOptions.cursor ?? '',
              cursorBlink: eraseOptions.cursorBlink ?? false,
              respectReducedMotion: eraseOptions.respectReducedMotion ?? false,
            }),
            seq.pause(450)
          );
        });
      }
    } catch {}
  }

  // Fallback defaults if json data is absent
  if (sloganSteps.length === 0) {
    staticSlogan = {
      slogan: 'typewriter animations.',
      mode: 'typeStyle: char · eraseStyle: end (backspace)',
    };
    sloganSteps = [
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
    ];
  }

  if (reduceMotion && staticSlogan) {
    heroSloganEl.textContent = staticSlogan.slogan;
    setMode(staticSlogan.mode);
  } else {
    TypeFlow.sequence(sloganSteps, { repeat: Infinity });
  }
}

// ─── Reveal/Erase/Caret Index Live Demos ──────────────────────────────────────

/**
 * Drives every `[data-tf-demo]` element on the page (used by the reveal/
 * erase/caret index guide): reads a JSON config from the element's own
 * `data-tf-demo` attribute, types the configured text in, holds, erases it,
 * and repeats. Each element keeps its literal text content as a no-JS/
 * pre-hydration fallback.
 */
function initIndexRevealEraseDemos() {
  const demoEls = document.querySelectorAll('[data-tf-demo]');
  if (!demoEls.length) return;
  const heightReservations = [];

  const reserveDemoHeight = (el, text) => {
    const width = el.getBoundingClientRect().width;
    if (width <= 0) return;
    const probe = el.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('data-tf-demo');
    probe.setAttribute('aria-hidden', 'true');
    probe.textContent = text;
    Object.assign(probe.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      inset: '0 auto auto 0',
      width: `${width}px`,
      minBlockSize: '0',
    });
    document.body.appendChild(probe);
    el.style.minBlockSize = `${Math.ceil(probe.getBoundingClientRect().height)}px`;
    probe.remove();
  };

  demoEls.forEach((el) => {
    let config;
    try {
      config = JSON.parse(el.dataset.tfDemo);
    } catch {
      return;
    }
    const text = config.text || el.textContent.trim();
    el.textContent = text;
    heightReservations.push({ el, text });
    reserveDemoHeight(el, text);

    const shared = {
      direction: config.direction || 'left',
      scrambleCharset: config.scrambleCharset || 'matrix',
      scrambleRounds: config.scrambleRounds ?? 2,
      trailFade: config.trailFade,
      html: config.html,
      speed: config.speed ?? 45,
      cursor: config.cursor ?? '|',
      cursorBlink: true,
      respectReducedMotion: true,
      wordOrder: config.wordOrder,
      wordLayout: config.wordLayout,
      wordFadeDuration: config.wordFadeDuration,
      wordStagger: config.wordStagger,
      wordSeed: config.wordSeed,
      wordMotionDistance: config.wordMotionDistance,
      wordMotionDepth: config.wordMotionDepth,
      wordMotionScale: config.wordMotionScale,
      wordMotionPerspective: config.wordMotionPerspective,
      wordMotionEasing: config.wordMotionEasing,
    };

    const steps = [
      seq.type(el, text, { ...shared, typeStyle: config.typeStyle || 'char' }),
      seq.pause(1800),
      seq.erase(el, { ...shared, eraseStyle: config.eraseStyle || 'end' }),
      seq.pause(500),
    ];

    TypeFlow.sequence(steps, { repeat: Infinity });
  });

  let resizeFrame = null;
  window.addEventListener('resize', () => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      heightReservations.forEach(({ el, text }) => reserveDemoHeight(el, text));
      resizeFrame = null;
    });
  }, { passive: true });
}

initIndexRevealEraseDemos();

/**
 * Drives every `[data-tf-caret-demo]` element: reads a JSON config
 * (`{ text, steps: [{ op, args }] }`) from the element's own attribute,
 * runs each Caret operation in order with a pause between, then resets and
 * repeats. Lazily imports the `@staticcanvas/typeflow/caret` bundle only
 * when at least one such element is present on the page.
 */
async function initIndexCaretDemos() {
  const demoEls = document.querySelectorAll('[data-tf-caret-demo]');
  if (!demoEls.length) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const { Caret } = await import(`../webutil/libs/typeflow-caret.esm.js${assetVersion}`);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  demoEls.forEach(async (el) => {
    let config;
    try {
      config = JSON.parse(el.dataset.tfCaretDemo);
    } catch {
      return;
    }

    while (document.contains(el)) {
      const caret = new Caret(el, { text: config.text, cursor: '|' });
      await sleep(900);
      for (const step of config.steps || []) {
        if (step.op === 'insert') {
          await caret.insert(...(step.args || []), { speed: 45 }).promise;
        } else {
          caret[step.op]?.(...(step.args || []));
        }
        await sleep(750);
      }
      await sleep(1600);
      caret.destroy();
    }
  });
}

initIndexCaretDemos();

// ─── Hero installation and usage Rolodex windows ──────────────────────────────

for (const terminal of document.querySelectorAll('[data-hero-rolodex]')) {
  const slides = [...terminal.querySelectorAll('[data-rolodex-slide]')];
  // Keep an inert copy beneath the animated code to reserve its full layout.
  const examples = slides.map((slide) => {
    const code = slide.querySelector('code');
    const html = code.innerHTML;
    const layer = document.createElement('span');
    layer.className = 'terminal-type-layer';
    const size = code.cloneNode(true);
    size.classList.add('terminal-code-size');
    size.setAttribute('aria-hidden', 'true');
    size.inert = true;
    code.dataset.liveCode = '';
    code.replaceWith(layer);
    layer.append(size, code);
    return { code, html };
  });
  const label = terminal.querySelector('[data-rolodex-label]');
  const pauseButton = terminal.querySelector('[data-rolodex-pause]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let timer;
  let animation;
  let typing;
  const pose = (angle, offset, opacity) => ({
    transform: `perspective(900px) translateY(${offset}px) rotateX(${angle}deg)`,
    opacity,
  });
  const show = () => {
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    label.textContent = slides[index].dataset.label;
    terminal.dataset.example = slides[index].dataset.example;
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !typing && !document.hidden && terminal.isConnected) timer = setTimeout(rotate, 6500);
  };
  const finishTyping = () => {
    typing?.stop();
    typing = null;
    const { code, html } = examples[index];
    TypeFlow.stop(code);
    code.innerHTML = html;
  };
  const typeExample = () => {
    clearTimeout(timer);
    if (paused || motion.matches || document.hidden) return;
    const { code, html } = examples[index];
    const controller = TypeFlow.type(code, html, {
      html: true,
      speed: terminal.classList.contains('terminal-install') ? 28 : 12,
      cursor: '|',
      cursorBlink: true,
      respectReducedMotion: true,
    });
    typing = controller;
    controller.promise.then(() => {
      if (typing !== controller) return;
      typing = null;
      schedule();
    });
  };
  const animate = async (frames, duration) => {
    animation = terminal.animate(frames, {
      duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards',
    });
    await animation.finished;
  };
  const rotate = async () => {
    try {
      finishTyping();
      if (!motion.matches) await animate([pose(0, 0, 1), pose(-65, -20, 0)], 360);
      index = (index + 1) % slides.length;
      show();
      animation?.cancel();
      typeExample();
      if (!motion.matches) await animate([pose(65, 20, 0), pose(0, 0, 1)], 480);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      animation?.cancel();
      animation = null;
      schedule();
    }
  };
  const syncPause = () => {
    pauseButton.textContent = paused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${terminal.classList.contains('terminal-install') ? 'installation' : 'usage'} rotation`);
    if (paused) {
      animation?.cancel();
      finishTyping();
    }
    schedule();
  };
  pauseButton.addEventListener('click', () => { paused = !paused; syncPause(); });
  motion.addEventListener('change', () => { paused = motion.matches; syncPause(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      animation?.cancel();
      finishTyping();
    }
    schedule();
  });
  window.addEventListener('pagehide', () => { clearTimeout(timer); animation?.cancel(); finishTyping(); });
  show();
  syncPause();
  typeExample();
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
      text: 'Type and erase one word at a time.',
      typeOpts: { typeStyle: 'word', speed: 50, cursor: '|' },
      eraseOpts: { eraseStyle: 'word', speed: 30 },
      hold: 2400,
    },
    'fade-trail': {
      stageId: 'matrix-stage-3',
      text: 'Fade characters along the trailing edge.',
      typeOpts: { typeStyle: 'fade-trail', trailFade: 5, trailingFadeLength: 5, speed: 36, cursor: '' },
      eraseOpts: { eraseStyle: 'fade-trail', trailFade: 5, trailingFadeLength: 5, speed: 22 },
      hold: 2500,
    },
    'scramble-matrix': {
      stageId: 'matrix-stage-4',
      text: 'Reveal text with matrix characters.',
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
      text: 'Reveal text with runic characters.',
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
      text: 'Clear the text without an erase animation.',
      typeOpts: { speed: 34, cursor: '|' },
      eraseOpts: { eraseStyle: 'instant' },
      hold: 2200,
    },
    'scramble-hieroglyphs': {
      stageId: 'matrix-stage-11',
      text: 'Reveal text with hieroglyph characters.',
      typeOpts: { typeStyle: 'scramble', scrambleGlyphs: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇', scrambleRounds: 2, speed: 38, cursor: '▍' },
      eraseOpts: { eraseStyle: 'scramble', scrambleGlyphs: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇', speed: 20 },
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
const pgWordOrder        = document.getElementById('pg-word-order');
const pgWordLayout       = document.getElementById('pg-word-layout');
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
const pgCodeOperation    = document.getElementById('pg-code-operation');

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
  let generatedCode = '';
  let snippetAction = 'type';
  let snippetPayload = null;

  const WORD_MOTION_STYLES = new Set([
    'word-fade', 'float-in-top', 'float-in-bottom', 'float-in-left', 'float-in-right', 'zoom-in-space',
  ]);
  // Playground-only pools are emitted as `scrambleGlyphs`, not as unsupported
  // core charset names, so preview and copied code use the same characters.
  const PLAYGROUND_GLYPH_POOLS = {
    hieroglyphs: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏',
    greek: 'αβγδεζηθικλμνξοπρστυφχψω',
    math: '∀∃∄∅∆∇∈∉∋∌∎∏∑−∓∔∕∖∗∘√∛∝∞',
    chess: '♔♕♖♗♘♙♚♛♜♝♞♟',
    geometric: '▲▼◀▶◆◇◈◉◊○●◐◑',
    astronomy: '☉☽☿♀♁♂♃♄♅♆♇',
    currency: '$€£¥₹₽₩₪₺₫฿',
    arrows: '←↑→↓↔↕↖↗↘↙',
  };

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

  const getOptions = (operation = 'type') => {
    const isErase = operation === 'erase';
    const style = isErase ? (pgEraseStyle?.value || 'end') : (pgTypeStyle?.value || 'char');
    const opts = {
      speed: Number(pgSpeed?.value ?? 40),
      delay: Number(pgDelay?.value ?? 0),
      speedVariance: Number(pgSpeedVariance?.value ?? 0),
      cursor: pgCursorChar?.value ?? '|',
      cursorBlink: pgCursorBlink?.checked ?? true,
      granularity: pgGranularity?.value || 'grapheme',
      respectReducedMotion: pgReducedMotion?.checked ?? false,
    };

    if (isErase) {
      opts.eraseStyle = style;
    } else {
      opts.direction = pgDirection?.value || 'left';
      opts.typeStyle = style;
      opts.html = pgHtml?.checked ?? true;
      opts.naturalCadence = pgNaturalCadence?.checked ?? false;
      if (operation === 'type') opts.mode = pgMode?.value || 'replace';
    }

    if (style === 'scramble') {
      const charset = pgScrambleCharset?.value || 'matrix';
      if (PLAYGROUND_GLYPH_POOLS[charset]) {
        opts.scrambleGlyphs = PLAYGROUND_GLYPH_POOLS[charset];
      } else {
        opts.scrambleCharset = charset;
      }
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

    if (style === 'fade-trail') {
      opts.trailFade = Number(pgFadeTrailLen?.value ?? 4);
      opts.trailMinOpacity = Number(pgFadeTrailMinOp?.value ?? 0.18);
    }

    if (WORD_MOTION_STYLES.has(style)) {
      opts.wordOrder = pgWordOrder?.value || 'left-to-right';
      opts.wordLayout = pgWordLayout?.value || 'opacity';
      opts.wordFadeDuration = Number(pgFadeDuration?.value ?? 280);
      if (pgStagger && Number(pgStagger.value) > 0) opts.wordStagger = Number(pgStagger.value);
    }

    if (isErase && style === 'fade') {
      opts.duration = Number(pgFadeDuration?.value ?? 250);
    }

    if (pgAudio?.value && pgAudio.value !== 'none' && pgAudio.value !== 'soundtrack') {
      opts.audio = pgAudio.value;
    }

    return opts;
  };

  const highlightJavaScript = (code) => {
    const escape = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const token = (kind, value) => `<span class="token-${kind}">${escape(value)}</span>`;
    const declarations = new Set(['class', 'const', 'function', 'import', 'let', 'var']);
    const keywords = new Set([
      'as', 'async', 'await', 'break', 'case', 'catch', 'continue', 'default',
      'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'from',
      'if', 'in', 'instanceof', 'new', 'of', 'return', 'static', 'switch',
      'throw', 'try', 'typeof', 'void', 'while', 'with', 'yield',
    ]);
    const constants = new Set(['false', 'Infinity', 'NaN', 'null', 'true', 'undefined']);
    let output = '';
    let index = 0;

    while (index < code.length) {
      const rest = code.slice(index);

      if (rest.startsWith('//')) {
        const length = rest.indexOf('\n') === -1 ? rest.length : rest.indexOf('\n');
        output += token('comment', rest.slice(0, length));
        index += length;
        continue;
      }
      if (rest.startsWith('/*')) {
        const close = rest.indexOf('*/', 2);
        const length = close === -1 ? rest.length : close + 2;
        output += token('comment', rest.slice(0, length));
        index += length;
        continue;
      }

      const quote = code[index];
      if (quote === "'" || quote === '"' || quote === '`') {
        let end = index + 1;
        while (end < code.length) {
          if (code[end] === '\\') {
            end += 2;
            continue;
          }
          if (code[end++] === quote) break;
        }
        output += token('string', code.slice(index, end));
        index = end;
        continue;
      }

      const whitespace = rest.match(/^\s+/)?.[0];
      if (whitespace) {
        output += whitespace;
        index += whitespace.length;
        continue;
      }

      const number = rest.match(/^(?:0[xob][\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?n?)/i)?.[0];
      if (number) {
        output += token('number', number);
        index += number.length;
        continue;
      }

      const identifier = rest.match(/^[A-Za-z_$][\w$]*/)?.[0];
      if (identifier) {
        const following = code.slice(index + identifier.length).trimStart();
        let kind = 'variable';
        if (declarations.has(identifier)) kind = 'declaration';
        else if (keywords.has(identifier)) kind = 'keyword';
        else if (constants.has(identifier)) kind = identifier === 'true' || identifier === 'false' ? 'boolean' : 'constant';
        else if (identifier === 'TypeFlow') kind = 'class';
        else if (following.startsWith(':')) kind = 'property';
        else if (following.startsWith('(')) kind = 'function';
        output += token(kind, identifier);
        index += identifier.length;
        continue;
      }

      const operator = rest.match(/^(?:===|!==|>>>|\?\?|\?\.|=>|==|!=|<=|>=|&&|\|\||\+\+|--|\*\*|\+=|-=|\*=|\/=|[+\-*/%=&|!<>?~^])/u)?.[0];
      if (operator) {
        output += token('operator', operator);
        index += operator.length;
        continue;
      }

      output += token('punctuation', code[index]);
      index += 1;
    }

    return output;
  };

  const cleanOptions = (options, operation) => {
    const defaults = operation === 'erase'
      ? {
          speed: 25, delay: 0, speedVariance: 0, cursor: '|', cursorBlink: false,
          granularity: 'grapheme', respectReducedMotion: true, eraseStyle: 'end',
          trailMinOpacity: 0.18, wordOrder: 'left-to-right', wordLayout: 'opacity',
          wordFadeDuration: 280, scrambleRounds: 2,
        }
      : {
          speed: 50, delay: 0, speedVariance: 0, cursor: '|', cursorBlink: true,
          granularity: 'grapheme', respectReducedMotion: true, direction: 'left',
          typeStyle: 'char', html: false, naturalCadence: false, mode: 'replace',
          trailMinOpacity: 0.18, wordOrder: 'left-to-right', wordLayout: 'opacity',
          wordFadeDuration: 280, scrambleRounds: 2,
        };
    return Object.fromEntries(
      Object.entries(options).filter(([key, value]) => !Object.is(defaults[key], value)),
    );
  };

  const formatOptions = (operation) => JSON.stringify(
    cleanOptions(getOptions(operation), operation),
    null,
    2,
  );

  const getStageCode = () => {
    const size = `${pgFontSize?.value || 24}px`;
    const font = pgFontFamily?.value || 'Inter';
    const align = pgTextAlign?.value || 'left';
    return `const target = document.querySelector('#target');\nObject.assign(target.style, {\n  fontSize: ${JSON.stringify(size)},\n  fontFamily: ${JSON.stringify(`"${font}", system-ui, sans-serif`)},\n  textAlign: ${JSON.stringify(align)}\n});`;
  };

  const getImportsCode = () => {
    const imports = ["import { TypeFlow } from '@staticcanvas/typeflow';"];
    if (pgMetricsToggle?.checked) imports.push("import { TypeFlowMetrics } from '@staticcanvas/typeflow/metrics';");
    if (pgDebugToggle?.checked) imports.push("import { TypeFlowDebug } from '@staticcanvas/typeflow/debug';");
    return imports.join('\n');
  };

  const getExtensionSetupCode = () => {
    const setup = [];
    if (pgMetricsToggle?.checked) setup.push("TypeFlowMetrics.mount({ position: 'bottom-right', detailed: false });");
    if (pgDebugToggle?.checked) setup.push('TypeFlowDebug.enable({ logcad: true, console: true });');
    if (pgAudio?.value === 'soundtrack') {
      setup.push(`const soundtrack = new Audio('https://staticcanvas.gitlab.io/typeflow/assets/audio/alexzavesa-dance-playful-night-510786.mp3');\nsoundtrack.volume = 0.55;\nsoundtrack.loop = true;\nawait soundtrack.play();`);
    }
    return setup.join('\n\n');
  };

  const updateCodeSnippet = (action = snippetAction, payload = snippetPayload) => {
    if (!pgCodeSnippet) return;
    snippetAction = action;
    snippetPayload = payload;

    const labels = {
      type: 'TypeFlow.type()', erase: 'TypeFlow.erase()', morph: 'TypeFlow.morph()',
      stream: 'TypeFlow.stream()', rotate: 'TypeFlow.rotate()',
    };
    if (pgCodeOperation) pgCodeOperation.textContent = labels[action] || labels.type;

    const sections = [getImportsCode(), getStageCode()];
    const extensionSetup = getExtensionSetupCode();
    if (extensionSetup) sections.push(extensionSetup);

    let operationCode;
    if (action === 'erase') {
      operationCode = `const options = ${formatOptions('erase')};\nconst controller = TypeFlow.erase(target, options);`;
    } else if (action === 'morph') {
      const nextText = typeof payload === 'string' ? payload : pgText.value;
      operationCode = `const options = ${formatOptions('morph')};\nconst controller = TypeFlow.morph(target, ${JSON.stringify(nextText)}, options);`;
    } else if (action === 'stream') {
      const chunks = Array.isArray(payload) ? payload : ['TypeFlow Stream Ingestion: ', 'tokens arrive asynchronously ', 'and render in sequence.'];
      if (pgAudio?.value === 'soundtrack') {
        operationCode = `const options = ${formatOptions('stream')};\nconst chunks = ${JSON.stringify(chunks, null, 2)};\nlet completedChunks = 0;\nconst stream = TypeFlow.stream(target, {\n  ...options,\n  onChunk: () => {\n    completedChunks += 1;\n    if (completedChunks === chunks.length) {\n      soundtrack.pause();\n      soundtrack.currentTime = 0;\n    }\n  }\n});\n\nfor (const chunk of chunks) {\n  stream.push(chunk);\n}`;
      } else {
        operationCode = `const options = ${formatOptions('stream')};\nconst chunks = ${JSON.stringify(chunks, null, 2)};\nconst stream = TypeFlow.stream(target, options);\n\nfor (const chunk of chunks) {\n  stream.push(chunk);\n}`;
      }
    } else if (action === 'rotate') {
      const words = Array.isArray(payload) ? payload : [pgText.value];
      operationCode = `const words = ${JSON.stringify(words, null, 2)};\nconst typeConfig = ${formatOptions('type')};\nconst eraseConfig = ${formatOptions('erase')};\n\nconst controller = TypeFlow.rotate(target, words, {\n  typeConfig,\n  eraseConfig,\n  holdDuration: 1400,\n  pauseBetween: 250,\n  repeat: 3\n});`;
    } else {
      operationCode = `const options = ${formatOptions('type')};\nconst controller = TypeFlow.type(target, ${JSON.stringify(pgText.value)}, options);`;
    }

    if (pgAudio?.value === 'soundtrack' && action !== 'stream') {
      operationCode += `\n\ncontroller.promise.finally(() => {\n  soundtrack.pause();\n  soundtrack.currentTime = 0;\n});`;
    }

    sections.push(operationCode);
    generatedCode = sections.join('\n\n');
    pgCodeSnippet.innerHTML = highlightJavaScript(generatedCode);
    syncControlCompatibility();
  };

  const setFieldCompatibility = (fieldId, enabled) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.toggle('is-incompatible', !enabled);
    field.setAttribute('aria-disabled', String(!enabled));
    field.querySelectorAll('select, input').forEach((control) => {
      control.disabled = !enabled;
    });
  };

  const syncControlCompatibility = () => {
    const typeStyle = pgTypeStyle?.value || 'char';
    const eraseStyle = pgEraseStyle?.value || 'end';
    const includesErase = snippetAction === 'erase' || snippetAction === 'rotate';
    const includesType = snippetAction !== 'erase';
    const usesScramble = (includesType && typeStyle === 'scramble') || (includesErase && eraseStyle === 'scramble');
    const usesTrail = (includesType && typeStyle === 'fade-trail') || (includesErase && eraseStyle === 'fade-trail');
    const usesWordMotion = (includesType && WORD_MOTION_STYLES.has(typeStyle))
      || (includesErase && WORD_MOTION_STYLES.has(eraseStyle));

    setFieldCompatibility('pg-charset-field', usesScramble);
    setFieldCompatibility('pg-scramble-color-field', usesScramble);
    setFieldCompatibility('pg-rounds-field', usesScramble);
    setFieldCompatibility('pg-fade-trail-field', usesTrail);
    setFieldCompatibility('pg-fade-trail-minop-field', usesTrail);
    setFieldCompatibility('pg-word-order-field', usesWordMotion);
    setFieldCompatibility('pg-word-layout-field', usesWordMotion);
    setFieldCompatibility('pg-word-stagger-field', usesWordMotion);
    setFieldCompatibility('pg-fade-duration-field', usesWordMotion || (includesErase && eraseStyle === 'fade'));
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
    pgWordOrder,
    pgWordLayout,
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
      if (el === pgTypeStyle) {
        snippetAction = 'type';
        snippetPayload = null;
      } else if (el === pgEraseStyle) {
        snippetAction = 'erase';
        snippetPayload = null;
      }
      syncControlCompatibility();
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
    syncControlCompatibility();
    updateStageStyles();
    updateCodeSnippet();
  });

  let soundtrackAudio = null;
  const syncSoundtrack = (play = true) => {
    if (pgAudio?.value === 'soundtrack') {
      if (!soundtrackAudio) {
        soundtrackAudio = new Audio();
        soundtrackAudio.src = new URL('../assets/audio/alexzavesa-dance-playful-night-510786.mp3', window.location.href).href;
        soundtrackAudio.volume = 0.55;
        soundtrackAudio.loop = true;
      }
      if (play) {
        soundtrackAudio.play().catch(() => {});
      } else {
        soundtrackAudio.pause();
        soundtrackAudio.currentTime = 0;
      }
    } else {
      if (soundtrackAudio) {
        soundtrackAudio.pause();
        soundtrackAudio.currentTime = 0;
      }
    }
  };

  let pgData = null;
  const pgDataEl = document.getElementById('playground-samples-data');
  if (pgDataEl) {
    try {
      pgData = JSON.parse(pgDataEl.textContent);
    } catch {}
  }

  // Sample Switcher
  pgSampleSelect?.addEventListener('change', () => {
    const val = pgSampleSelect.value;
    if (pgData?.samples && pgData.samples[val]) {
      const cfg = pgData.samples[val];
      pgText.value = cfg.text || '';
      if (cfg.fontFamily && pgFontFamily) pgFontFamily.value = cfg.fontFamily;
      if (cfg.typeStyle && pgTypeStyle) pgTypeStyle.value = cfg.typeStyle;
      if (cfg.direction && pgDirection) pgDirection.value = cfg.direction;
      if (cfg.scrambleCharset && pgScrambleCharset) pgScrambleCharset.value = cfg.scrambleCharset;
      if (typeof cfg.html === 'boolean' && pgHtml) pgHtml.checked = cfg.html;
    } else if (val === 'headline') {
      pgText.value = 'Build modern resilient interfaces with TypeFlow.';
    } else if (val === 'progress') {
      pgText.value = 'Deploying Assets [████████████████████░░░░░░░░░░] 67% (42/63 MB)';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'chart') {
      pgText.value = 'Throughput:  ▂▃▄▅▆▇█ 94.2 MB/s | Heap: ████████░░ 78%';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'pipeline') {
      pgText.value = '[✓ Lint] ➔ [⚡ Build (ESM/CJS)] ➔ [▶ Test (48/48)] ➔ [🚀 Released]';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'braille') {
      pgText.value = 'CPU Core Matrix: ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ [⡿⣿⢿⣻⣽⣾] Peak: 98.4%';
      if (pgFontFamily) pgFontFamily.value = 'JetBrains Mono';
    } else if (val === 'html') {
      pgText.value = 'Deploy to <strong>Production</strong> with <span class="highlight">Zero Downtime</span>.';
    } else if (val === 'cyber') {
      pgText.value = 'BUILD STATUS RUNNING | ESLP: 10m 3s';
    } else if (val === 'code') {
      pgText.value = 'const session = await TypeFlow.stream(target, { speed: 20 });';
    }
    syncControlCompatibility();
    updateStageStyles();
    updateCodeSnippet();
  });

  // Action: Type
  btnType.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(true);
    setStatus('Typing...', true);
    updateStageStyles();

    updateCodeSnippet('type');
    const opts = getOptions('type');
    opts.onComplete = (_text) => {
      syncSoundtrack(false);
      setStatus('Complete', false);
    };
    opts.onInterrupt = () => {
      syncSoundtrack(false);
      setStatus('Interrupted', false);
    };

    activeController = TypeFlow.type(pgStage, pgText.value, opts);
  });

  // Action: Erase
  btnErase?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(true);
    setStatus('Erasing...', true);

    updateCodeSnippet('erase');
    const opts = getOptions('erase');
    opts.onComplete = () => {
      syncSoundtrack(false);
      setStatus('Erased', false);
    };
    opts.onInterrupt = () => {
      syncSoundtrack(false);
      setStatus('Interrupted', false);
    };

    activeController = TypeFlow.erase(pgStage, opts);
  });

  // Action: Morph
  let morphIndex = 0;
  const defaultMorphPhrases = [
    'Progress [████████░░] 80%',
    'Progress [██████████] 100%',
    'Throughput:  ▂▃▄▅▆▇█ 94.2 MB/s',
    'TypeFlow is lightweight and fast.',
    'TypeFlow is robust and resilient.'
  ];
  btnMorph?.addEventListener('click', async () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(true);
    setStatus('Morphing...', true);
    updateStageStyles();

    let activePool = defaultMorphPhrases;
    const currentSample = pgSampleSelect?.value;
    if (currentSample === 'progress' && pgData?.progressSteps?.length) {
      activePool = pgData.progressSteps;
    } else if (currentSample === 'chart' && pgData?.chartSteps?.length) {
      activePool = pgData.chartSteps;
    } else if (currentSample === 'pipeline' && pgData?.pipelineSteps?.length) {
      activePool = pgData.pipelineSteps;
    }

    morphIndex = (morphIndex + 1) % activePool.length;
    const nextPhrase = activePool[morphIndex];
    updateCodeSnippet('morph', nextPhrase);
    const opts = getOptions('morph');

    activeController = TypeFlow.morph(pgStage, nextPhrase, {
      ...opts,
      onComplete: () => {
        syncSoundtrack(false);
        setStatus(`Morphed (${morphIndex + 1}/${activePool.length})`, false);
      },
      onInterrupt: () => {
        syncSoundtrack(false);
        setStatus('Interrupted', false);
      }
    });
  });

  // Action: Stream
  btnStream?.addEventListener('click', async () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(true);
    pgStage.textContent = '';
    setStatus('Streaming LLM Tokens...', true);
    updateStageStyles();

    const chunks = pgData?.streamChunks || [
      'TypeFlow Stream Ingestion: ',
      'tokens arrive asynchronously ',
      'from server-sent events (SSE) ',
      'and render fluidly ',
      'with zero DOM lag or layout shift!'
    ];
    updateCodeSnippet('stream', chunks);
    const opts = getOptions('stream');
    let completedChunks = 0;

    const stream = TypeFlow.stream(pgStage, {
      ...opts,
      onChunk: (_chunk) => {
        completedChunks += 1;
        setStatus(`Streaming... (${pgStage.textContent.length} chars)`, true);
        if (completedChunks === chunks.length) {
          syncSoundtrack(false);
          setStatus('Stream finished', false);
        }
      },
    });
    activeStream = stream;

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 100 : 350));
      stream.push(chunks[i]);
    }
  });

  // Action: Rotate
  btnRotator?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(true);
    setStatus('Rotating...', true);
    updateStageStyles();

    const words = [
      'Deploying Assets [████████████████████░░░░░░░░░░] 67%',
      'Throughput:  ▂▃▄▅▆▇█ 94.2 MB/s | Heap: ████████░░ 78%',
      'Declarative animations with zero layout shift.',
      'Procedural Web Audio clicks and MP3 sync.'
    ];

    updateCodeSnippet('rotate', words);
    const typeConfig = getOptions('type');
    const eraseConfig = getOptions('erase');

    activeController = TypeFlow.rotate(pgStage, words, {
      typeConfig,
      eraseConfig,
      holdDuration: 1400,
      pauseBetween: 250,
      repeat: 3,
    });
    activeController.promise.then(({ completed }) => {
      if (completed) {
        syncSoundtrack(false);
        setStatus('Rotation Complete', false);
      }
    });
  });

  // Action: Stop
  btnStop?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(false);
    TypeFlow.stop(pgStage);
    setStatus('Stopped', false);
  });

  // Action: Reset
  btnReset?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(false);
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

    snippetAction = 'type';
    snippetPayload = null;
    syncControlCompatibility();
    updateStageStyles();
    updateCodeSnippet();
    setStatus('Reset', false);
  });

  // Action: Clear
  btnClear?.addEventListener('click', () => {
    activeController?.stop();
    activeStream?.stop();
    syncSoundtrack(false);
    pgStage.replaceChildren();
    setStatus('Cleared', false);
  });

  // Action: Copy Code
  btnCopyCode?.addEventListener('click', async () => {
    if (!pgCodeSnippet) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
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
    updateCodeSnippet();
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
    updateCodeSnippet();
  };

  pgDebugToggle?.addEventListener('change', () => {
    setDebugActive(pgDebugToggle.checked);
  });

  btnDebug?.addEventListener('click', () => {
    const next = !pgDebugToggle?.checked;
    setDebugActive(next);
  });

  /**
   * Applies a configuration passed via URL query params (e.g. from the
   * reveal/erase/caret index's "Try in Playground" links) to the form
   * fields, so a deep link reproduces the exact demoed animation.
   * @returns {boolean} Whether any recognized param was present.
   */
  const applyPlaygroundConfigFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].length) return false;

    const setField = (el, key, eventType) => {
      if (!el || !params.has(key)) return;
      el.value = params.get(key);
      el.dispatchEvent(new Event(eventType, { bubbles: true }));
    };
    const setChecked = (el, key) => {
      if (!el || !params.has(key)) return;
      el.checked = params.get(key) === 'true';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    setField(pgText, 'text', 'change');
    setField(pgDirection, 'direction', 'change');
    setField(pgTypeStyle, 'typeStyle', 'change');
    setField(pgEraseStyle, 'eraseStyle', 'change');
    setField(pgWordOrder, 'wordOrder', 'change');
    setField(pgWordLayout, 'wordLayout', 'change');
    setField(pgScrambleCharset, 'scrambleCharset', 'change');
    setField(pgGranularity, 'granularity', 'change');
    setField(pgMode, 'mode', 'change');
    setField(pgCursorChar, 'cursor', 'change');
    setField(pgSpeed, 'speed', 'input');
    setField(pgStagger, 'wordStagger', 'input');
    setField(pgFadeDuration, 'wordFadeDuration', 'input');
    setField(pgScrambleRounds, 'scrambleRounds', 'input');
    setField(pgFadeTrailLen, 'trailFadeLength', 'input');
    setField(pgFadeTrailMinOp, 'trailFadeMinOpacity', 'input');
    setChecked(pgHtml, 'html');
    setChecked(pgCursorBlink, 'cursorBlink');
    setChecked(pgReducedMotion, 'respectReducedMotion');

    return true;
  };

  // Initial load execution
  const configuredFromURL = applyPlaygroundConfigFromURL();
  syncControlCompatibility();
  updateStageStyles();
  updateCodeSnippet();
  activeController = TypeFlow.type(pgStage, pgText.value, getOptions('type'));
  if (configuredFromURL) pgStage.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
        content: rawText || pageText,
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
            const rawSectionMarkdown = currentSectionLines.join('\n').trim();
            const cleanPlain = rawSectionMarkdown.replace(/<[^>]+>/g, '').replace(/```[\s\S]*?```/g, '').replace(/\s+/g, ' ').trim();
            if (rawSectionMarkdown.length > 5 || currentHeading.length > 2) {
              const headingWords = currentHeading.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
              items.push({
                title: pageTitle,
                heading: currentHeading,
                anchor: `#${currentSlug}`,
                permalink: `${pageUrl}#${currentSlug}`,
                description: cleanPlain.slice(0, 160) || pageDesc,
                category,
                keywords: [...keywords, ...headingWords],
                content: rawSectionMarkdown,
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
              currentSectionLines.push(line);
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
   * Converts markdown formatting (code blocks, tables, inline code, bold, italic, quotes, lists, links, alerts)
   * into clean, balanced HTML for search preview typography without broken syntax.
   * @param {string} md
   * @param {string} [query='']
   * @returns {string}
   */
  const formatMarkdownSnippet = (md, query = '') => {
    if (!md) return '';

    // 1. Strip Hugo shortcodes, HTML comments, and frontmatter delimiters
    let text = String(md)
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, '')
      .replace(/^---[\s\S]*?---\n*/, '')
      .trim();

    // 2. Limit excessive length while keeping code fences intact
    if (text.length > 550) {
      text = text.slice(0, 550);
      // If truncation cut off inside a fenced code block, we will close it below
    }

    // 3. Escape HTML special chars to prevent unescaped injections
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 4. Fenced Code Blocks (closed and unclosed due to truncation)
    safe = safe.replace(/```(?:[a-zA-Z0-9_+-]+)?\n([\s\S]*?)```/g, (_m, code) => {
      return `\n\n<pre><code>${code.trim()}</code></pre>\n\n`;
    });
    // Handle unclosed trailing fence if snippet was truncated
    safe = safe.replace(/```(?:[a-zA-Z0-9_+-]+)?\n([\s\S]*)$/g, (_m, code) => {
      return `\n\n<pre><code>${code.trim()}</code></pre>\n\n`;
    });

    // 5. Markdown Tables
    safe = safe.replace(/((?:^\|.+?\|\r?\n)+)/gm, (tableBlock) => {
      const rows = tableBlock.trim().split('\n').map((r) => r.trim()).filter(Boolean);
      if (rows.length < 2) return tableBlock;
      // Filter out separator row |--|--|
      const validRows = rows.filter((r) => !/^\|[\s\-:|]+\|$/.test(r));
      if (validRows.length === 0) return '';

      const headerRow = validRows[0];
      const bodyRows = validRows.slice(1);

      const parseCells = (row) => row.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

      const ths = parseCells(headerRow).map((c) => `<th>${c}</th>`).join('');
      const trs = bodyRows.map((r) => {
        const tds = parseCells(r).map((c) => `<td>${c}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');

      return `\n\n<table class="search-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>\n\n`;
    });

    // 6. GitHub Alert Blockquotes (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION])
    safe = safe.replace(/^&gt;\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/gim, (_m, type, content) => {
      const t = type.toUpperCase();
      return `\n\n<blockquote class="search-alert search-alert-${t.toLowerCase()}"><strong>${t}:</strong> ${content.trim()}</blockquote>\n\n`;
    });

    // 7. Standard Blockquotes (> quote)
    safe = safe.replace(/^&gt;\s*(.+)$/gm, '<blockquote>$1</blockquote>');

    // 8. Markdown Headings (# Heading, ## Heading, etc.)
    safe = safe.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');

    // 9. Horizontal Rules (---, ***, ___)
    safe = safe.replace(/^(\-{3,}|\*{3,}|_{3,})$/gm, '<hr class="search-hr">');

    // 10. Links [text](url) and Images ![alt](url)
    safe = safe.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<em>[Image: $1]</em>');
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="search-preview-link" target="_blank" rel="noopener">$1</a>');

    // 11. Inline Code `code`
    safe = safe.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // Handle dangling single backtick if truncated
    safe = safe.replace(/`([^`\n]+)$/g, '<code>$1</code>');

    // 12. Bold **bold** or __bold__
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // 13. Italic *italic* or _italic_
    safe = safe.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');
    safe = safe.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3');

    // 14. Strikethrough ~~text~~
    safe = safe.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 15. Unordered Lists (- item or * item)
    safe = safe.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    safe = safe.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');

    // 16. Ordered Lists (1. item)
    safe = safe.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // 17. Paragraph wrapping
    const blocks = safe.split(/\n\n+/);
    let html = blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<pre>') ||
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('<ol>') ||
        trimmed.startsWith('<blockquote>') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('');

    // 18. Query Word Highlighting (without corrupting HTML tag attributes)
    if (query && query.trim().length > 1) {
      const terms = query.trim().split(/\s+/).filter((t) => t.length > 1);
      if (terms.length > 0) {
        const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        const parts = html.split(/(<[^>]+>)/g);
        html = parts.map((part) => {
          if (part.startsWith('<') && part.endsWith('>')) return part;
          return part.replace(regex, '<mark class="search-match">$1</mark>');
        }).join('');
      }
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
    const rawSnippet = item.content || item.description;

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
        allowedTags: [
          'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'strong', 'em', 'blockquote', 'p', 'ul', 'ol', 'li',
          'mark', 'a', 'kbd', 'span', 'b', 'i', 'br', 'hr', 'del'
        ],
        speed: 2,
        cursor: '',
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
        if (active) {
          active.classList.add('toc-active');
          const toc = active.closest('.doc-toc');
          if (toc) {
            const tocBounds = toc.getBoundingClientRect();
            const linkBounds = active.getBoundingClientRect();
            if (linkBounds.top < tocBounds.top || linkBounds.bottom > tocBounds.bottom) {
              toc.scrollTo({
                top: toc.scrollTop + linkBounds.top - tocBounds.top - (toc.clientHeight / 2),
                behavior: reduceMotion ? 'auto' : 'smooth',
              });
            }
          }
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  headings.forEach((h) => observer.observe(h));
}
