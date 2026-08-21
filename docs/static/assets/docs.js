/**
 * TypeFlow Documentation Interactive Scripts & Demos
 */

import { TypeFlow } from '../../webutil/libs/typeflow.esm.js';

const root = document.documentElement;

// Theme Toggle
const themeToggleBtn = document.querySelector('[data-theme-toggle]');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    localStorage.setItem('typeflow-docs-theme', nextTheme);
  });
}

// Copy Code Buttons
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    } catch {}
  });
});

document.querySelectorAll('pre').forEach((pre) => {
  if (pre.querySelector('.copy-button')) return;
  const btn = document.createElement('button');
  btn.className = 'copy-button';
  btn.type = 'button';
  btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code')?.textContent || pre.textContent;
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    } catch {}
  });
  pre.classList.add('copy-wrap');
  pre.appendChild(btn);
});

// Code Tabs Switching
document.querySelectorAll('[data-code-tabs]').forEach((tabset) => {
  const tabs = [...tabset.querySelectorAll('[data-code-tab]')];
  const panels = [...tabset.querySelectorAll('[data-code-panel]')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const isSel = t === tab;
        t.setAttribute('aria-selected', String(isSel));
      });
      panels.forEach((p) => {
        p.hidden = p.dataset.codePanel !== tab.dataset.codeTab;
      });
    });
  });
});

// Live Hero Typewriter Demo
const heroEl = document.getElementById('hero-typewriter');
if (heroEl) {
  TypeFlow.rotate(heroEl, [
    'Zero dependencies.',
    'Safe HTML tag balancing.',
    'Multi-directional erase modes.',
    'Sequential conversational flows.'
  ], {
    typeConfig: { speed: 45, cursor: '|', cursorBlink: true },
    eraseConfig: { eraseStyle: 'end', speed: 20 },
    holdDuration: 1800,
    pauseBetween: 300,
    repeat: Infinity
  });
}

// Interactive Playground Workbench
const pgStage = document.getElementById('pg-stage');
const pgText = document.getElementById('pg-text');
const pgSpeed = document.getElementById('pg-speed');
const pgSpeedVal = document.getElementById('pg-speed-val');
const pgEraseStyle = document.getElementById('pg-erase-style');
const pgHtml = document.getElementById('pg-html');
const pgBlink = document.getElementById('pg-cursor-blink');

const btnType = document.getElementById('pg-btn-type');
const btnErase = document.getElementById('pg-btn-erase');
const btnStop = document.getElementById('pg-btn-stop');
const btnRotator = document.getElementById('pg-btn-rotator');

if (pgStage && btnType) {
  let activeController = null;

  if (pgSpeed && pgSpeedVal) {
    pgSpeed.addEventListener('input', () => { pgSpeedVal.textContent = pgSpeed.value; });
  }

  const getConfig = () => ({
    speed: Number(pgSpeed?.value || 40),
    cursor: '|',
    cursorBlink: pgBlink?.checked ?? true,
    html: pgHtml?.checked ?? true,
    eraseStyle: pgEraseStyle?.value || 'end',
  });

  btnType.addEventListener('click', () => {
    activeController?.stop();
    activeController = TypeFlow.type(pgStage, pgText.value, getConfig());
  });

  btnErase?.addEventListener('click', () => {
    activeController?.stop();
    activeController = TypeFlow.erase(pgStage, getConfig());
  });

  btnStop?.addEventListener('click', () => {
    activeController?.stop();
    TypeFlow.stop(pgStage);
  });

  btnRotator?.addEventListener('click', () => {
    activeController?.stop();
    const words = [
      'Declarative animations.',
      'Interruptible promises.',
      'Pure ECMAScript.'
    ];
    activeController = TypeFlow.rotate(pgStage, words, {
      typeConfig: getConfig(),
      eraseConfig: getConfig(),
      holdDuration: 1200,
      pauseBetween: 200,
      repeat: 2
    });
  });

  // Initial render
  activeController = TypeFlow.type(pgStage, pgText.value, getConfig());
}

// Client Search Functionality
const searchInput = document.getElementById('site-search');
const searchResults = document.getElementById('search-results');
if (searchInput && searchResults) {
  let indexData = [];
  const loadIndex = async () => {
    if (indexData.length) return;
    try {
      const res = await fetch(document.body.dataset.searchIndex || 'index.json');
      indexData = await res.json();
    } catch {}
  };

  searchInput.addEventListener('focus', loadIndex);
  searchInput.addEventListener('input', async () => {
    await loadIndex();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.hidden = true;
      searchResults.innerHTML = '';
      return;
    }
    const matches = indexData.filter((item) =>
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query)
    ).slice(0, 6);

    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-desc">No matching documents found.</span></div>';
    } else {
      searchResults.innerHTML = matches.map((m) => `
        <a class="search-result-item" href="${m.permalink}">
          <div class="search-result-title">${m.title}</div>
          <div class="search-result-desc">${m.description || m.content || ''}</div>
        </a>
      `).join('');
    }
    searchResults.hidden = false;
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      searchResults.hidden = true;
    }
  });
}

// TOC Active Section Highlighting
const tocLinks = document.querySelectorAll('.doc-toc nav a');
if (tocLinks.length) {
  const headings = [...document.querySelectorAll('.doc-content h2, .doc-content h3')];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocLinks.forEach((a) => a.classList.remove('toc-active'));
        const active = [...tocLinks].find((a) => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  headings.forEach((h) => obs.observe(h));
}
