/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow Metrics - Real-time Performance HUD & Diagnostic Tooltip.
 * Mounts an accessible, zero-CLS floating metrics badge/window in the viewport
 * tracking active animations, FPS, typed/erased units, render latency, and heap memory.
 *
 * @module @staticcanvas/typeflow/metrics
 */

export class TypeFlowMetrics {
  static instance = null;

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Constructs and initializes a TypeFlowMetrics tracker.
   * @param {Object} [options={}] - Configuration options.
   *
   * -------------
   *
   * @Properties
   * @param {'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'} [options.position='bottom-right'] - Screen corner location.
   * @param {boolean} [options.detailed=false] - Whether to start with the expanded modal open.
   * @param {boolean} [options.autoTrack=true] - Whether to observe global DOM mutations and animations.
   * @param {number}  [options.updateInterval=250] - Metric polling interval in milliseconds.
   * @param {number}  [options.zIndex=99999] - CSS z-index for floating badge.
   *
   * -------------
   *
   * @example
   * const metrics = new TypeFlowMetrics({ position: 'bottom-right', detailed: true });
   */
  constructor(options = {}) {
    this.options = {
      position: 'bottom-right',
      detailed: false,
      autoTrack: true,
      updateInterval: 250,
      zIndex: 99999,
      ...options,
    };

    this.stats = {
      fps: 60,
      activeInstances: 0,
      totalTyped: 0,
      totalErased: 0,
      renderLatencyMs: 0,
      domMutations: 0,
      interruptions: 0,
      startTime: performance.now(),
      lastFrameTime: performance.now(),
      frameCount: 0,
      history: [],
    };

    this.container = null;
    this.isExpanded = Boolean(this.options.detailed);
    this.rafId = null;
    this.intervalId = null;
    this.observer = null;

    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Mounts the singleton floating HUD metrics badge into the active browser document.
   * @param {Object} [options={}] - Custom configuration options.
   * @returns {TypeFlowMetrics} The active singleton instance.
   *
   * -------------
   *
   * @Properties
   * @param {'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'} [options.position='bottom-right'] - Screen corner location.
   * @param {boolean} [options.detailed=false] - Whether to open expanded view initially.
   *
   * -------------
   *
   * @example
   * TypeFlowMetrics.mount({ position: 'bottom-right' });
   */
  static mount(options = {}) {
    if (!TypeFlowMetrics.instance) {
      TypeFlowMetrics.instance = new TypeFlowMetrics(options);
    }
    return TypeFlowMetrics.instance;
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Unmounts the singleton floating HUD metrics badge and stops all listeners.
   * @returns {void}
   *
   * -------------
   *
   * @example
   * TypeFlowMetrics.unmount();
   */
  static unmount() {
    if (TypeFlowMetrics.instance) {
      TypeFlowMetrics.instance.destroy();
      TypeFlowMetrics.instance = null;
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Returns a snapshot object of current performance metrics.
   * @returns {Object | null} Metric snapshot data or null if not mounted.
   *
   * -------------
   *
   * @example
   * const stats = TypeFlowMetrics.getStats();
   * console.log('Active animations:', stats?.activeInstances);
   */
  static getStats() {
    return TypeFlowMetrics.instance ? TypeFlowMetrics.instance.getSnapshot() : null;
  }

  init() {
    this.createDom();
    this.startFpsTracker();
    this.startDomMutationObserver();

    this.intervalId = setInterval(() => {
      this.updateMetrics();
    }, this.options.updateInterval);
  }

  createDom() {
    if (this.container || typeof document === 'undefined') return;

    this.container = document.createElement('aside');
    this.container.id = 'typeflow-metrics-hud';
    this.container.setAttribute('aria-label', 'TypeFlow Performance Metrics HUD');
    this.container.setAttribute('role', 'region');

    const posStyles = {
      'bottom-right': 'bottom: 16px; right: 16px;',
      'bottom-left': 'bottom: 16px; left: 16px;',
      'top-right': 'top: 16px; right: 16px;',
      'top-left': 'top: 16px; left: 16px;',
    };

    const style = document.createElement('style');
    style.textContent = `
      #typeflow-metrics-hud {
        position: fixed;
        ${posStyles[this.options.position] || posStyles['bottom-right']}
        z-index: ${this.options.zIndex};
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        color: #f1f5f9;
        user-select: none;
        box-sizing: border-box;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #typeflow-metrics-hud * {
        box-sizing: border-box;
      }
      .tf-hud-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9999px;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 107, 43, 0.15);
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .tf-hud-pill:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 107, 43, 0.5);
        box-shadow: 0 6px 24px -2px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 107, 43, 0.3);
      }
      .tf-hud-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        transition: background 0.3s ease;
      }
      .tf-hud-dot.active {
        background: #ff6b2b;
        box-shadow: 0 0 10px #ff6b2b;
        animation: tf-hud-pulse 1.5s infinite;
      }
      @keyframes tf-hud-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.25); opacity: 0.7; }
      }
      .tf-hud-mono {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        letter-spacing: -0.02em;
      }
      .tf-hud-label {
        color: #94a3b8;
        font-size: 11px;
      }
      .tf-hud-modal {
        display: none;
        width: 290px;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 107, 43, 0.15);
        padding: 14px;
        margin-top: 8px;
        animation: tf-hud-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes tf-hud-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .tf-hud-modal.open {
        display: block;
      }
      .tf-hud-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 10px;
      }
      .tf-hud-title {
        font-family: 'Lexend', sans-serif;
        font-weight: 600;
        font-size: 13px;
        background: linear-gradient(135deg, #ff6b2b, #38bdf8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .tf-hud-close {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 1;
      }
      .tf-hud-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .tf-hud-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .tf-hud-card {
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 8px 10px;
      }
      .tf-hud-card-label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 2px;
      }
      .tf-hud-card-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 600;
        color: #e2e8f0;
      }
      .tf-hud-accent {
        color: #ff6b2b;
      }
      .tf-hud-cyan {
        color: #38bdf8;
      }
      .tf-hud-green {
        color: #10b981;
      }
      .tf-hud-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 10px;
        color: #64748b;
      }
      .tf-hud-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tf-hud-btn:hover {
        background: rgba(255, 107, 43, 0.2);
        border-color: rgba(255, 107, 43, 0.4);
        color: #ff6b2b;
      }
    `;

    const pill = document.createElement('div');
    pill.className = 'tf-hud-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('tabindex', '0');
    pill.innerHTML = `
      <span class="tf-hud-dot" id="tf-hud-dot"></span>
      <span class="tf-hud-mono" id="tf-hud-fps">60 FPS</span>
      <span class="tf-hud-label">•</span>
      <span class="tf-hud-mono tf-hud-accent" id="tf-hud-active">0 Active</span>
    `;

    const modal = document.createElement('div');
    modal.className = `tf-hud-modal ${this.isExpanded ? 'open' : ''}`;
    modal.id = 'tf-hud-modal';
    modal.innerHTML = `
      <div class="tf-hud-header">
        <span class="tf-hud-title">TypeFlow Metrics</span>
        <button class="tf-hud-close" id="tf-hud-close" aria-label="Close Metrics Window">✕</button>
      </div>
      <div class="tf-hud-grid">
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">Frame Rate</div>
          <div class="tf-hud-card-val tf-hud-green" id="tf-hud-m-fps">60.0 FPS</div>
        </div>
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">Active Anim</div>
          <div class="tf-hud-card-val tf-hud-accent" id="tf-hud-m-active">0</div>
        </div>
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">Typed Units</div>
          <div class="tf-hud-card-val tf-hud-cyan" id="tf-hud-m-typed">0</div>
        </div>
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">Erased Units</div>
          <div class="tf-hud-card-val" id="tf-hud-m-erased">0</div>
        </div>
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">DOM Mut.</div>
          <div class="tf-hud-card-val" id="tf-hud-m-mut">0</div>
        </div>
        <div class="tf-hud-card">
          <div class="tf-hud-card-label">Heap Memory</div>
          <div class="tf-hud-card-val tf-hud-mono" id="tf-hud-m-mem">-- MB</div>
        </div>
      </div>
      <div class="tf-hud-footer">
        <span id="tf-hud-uptime">Uptime: 0s</span>
        <div style="display:flex;gap:4px;">
          <button class="tf-hud-btn" id="tf-hud-copy">Copy JSON</button>
          <button class="tf-hud-btn" id="tf-hud-reset">Reset</button>
        </div>
      </div>
    `;

    this.container.appendChild(style);
    this.container.appendChild(pill);
    this.container.appendChild(modal);
    document.body.appendChild(this.container);

    pill.addEventListener('click', () => this.toggleModal());
    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleModal();
      }
    });

    modal.querySelector('#tf-hud-close')?.addEventListener('click', () => this.toggleModal(false));
    modal.querySelector('#tf-hud-reset')?.addEventListener('click', () => this.resetStats());
    modal.querySelector('#tf-hud-copy')?.addEventListener('click', () => this.copyStats());
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Toggles or sets the visibility of the expanded metrics window modal.
   * @param {boolean} [forceState] - Optional explicit state boolean.
   * @returns {void}
   *
   * -------------
   *
   * @example
   * hud.toggleModal(true); // Open
   * hud.toggleModal(false); // Close
   */
  toggleModal(forceState) {
    this.isExpanded = forceState !== undefined ? forceState : !this.isExpanded;
    const modal = this.container?.querySelector('#tf-hud-modal');
    if (modal) {
      modal.classList.toggle('open', this.isExpanded);
    }
  }

  startFpsTracker() {
    let lastTime = performance.now();
    let frames = 0;

    const tick = (now) => {
      frames++;
      if (now >= lastTime + 1000) {
        this.stats.fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  startDomMutationObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    this.observer = new MutationObserver((mutations) => {
      let relevant = 0;
      for (const m of mutations) {
        if (m.target === this.container || this.container?.contains(m.target)) continue;
        if (m.target.nodeType === 1 && m.target.classList?.contains('tf-cursor')) continue;
        relevant++;
      }
      this.stats.domMutations += relevant;
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  recordTyped(count = 1) {
    this.stats.totalTyped += count;
  }

  recordErased(count = 1) {
    this.stats.totalErased += count;
  }

  recordInterruption() {
    this.stats.interruptions += 1;
  }

  updateMetrics() {
    if (!this.container) return;

    if (typeof window !== 'undefined' && window.TypeFlow?.active) {
      this.stats.activeInstances = window.TypeFlow.active.size;
    }

    const dot = this.container.querySelector('#tf-hud-dot');
    const fpsEl = this.container.querySelector('#tf-hud-fps');
    const activeEl = this.container.querySelector('#tf-hud-active');

    if (dot) dot.classList.toggle('active', this.stats.activeInstances > 0);
    if (fpsEl) fpsEl.textContent = `${this.stats.fps} FPS`;
    if (activeEl) activeEl.textContent = `${this.stats.activeInstances} Active`;

    if (this.isExpanded) {
      const mFps = this.container.querySelector('#tf-hud-m-fps');
      const mActive = this.container.querySelector('#tf-hud-m-active');
      const mTyped = this.container.querySelector('#tf-hud-m-typed');
      const mErased = this.container.querySelector('#tf-hud-m-erased');
      const mMut = this.container.querySelector('#tf-hud-m-mut');
      const mMem = this.container.querySelector('#tf-hud-m-mem');
      const mUptime = this.container.querySelector('#tf-hud-uptime');

      if (mFps) mFps.textContent = `${this.stats.fps}.0 FPS`;
      if (mActive) mActive.textContent = `${this.stats.activeInstances}`;
      if (mTyped) mTyped.textContent = this.stats.totalTyped.toLocaleString();
      if (mErased) mErased.textContent = this.stats.totalErased.toLocaleString();
      if (mMut) mMut.textContent = this.stats.domMutations.toLocaleString();

      if (mMem) {
        if (performance.memory?.usedJSHeapSize) {
          const mb = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
          mMem.textContent = `${mb} MB`;
        } else {
          mMem.textContent = 'Native';
        }
      }

      if (mUptime) {
        const sec = Math.floor((performance.now() - this.stats.startTime) / 1000);
        mUptime.textContent = `Uptime: ${sec}s`;
      }
    }
  }

  resetStats() {
    this.stats.totalTyped = 0;
    this.stats.totalErased = 0;
    this.stats.domMutations = 0;
    this.stats.interruptions = 0;
    this.stats.startTime = performance.now();
    this.updateMetrics();
  }

  copyStats() {
    const json = JSON.stringify(this.getSnapshot(), null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json);
      const btn = this.container?.querySelector('#tf-hud-copy');
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = prev;
        }, 1500);
      }
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Returns a snapshot object of lifetime metrics.
   * @returns {Object} Metric data snapshot.
   */
  getSnapshot() {
    return {
      timestamp: new Date().toISOString(),
      fps: this.stats.fps,
      activeInstances: this.stats.activeInstances,
      totalTyped: this.stats.totalTyped,
      totalErased: this.stats.totalErased,
      domMutations: this.stats.domMutations,
      interruptions: this.stats.interruptions,
      uptimeSeconds: Math.floor((performance.now() - this.stats.startTime) / 1000),
    };
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Cleans up observers, timers, and removes the HUD from the DOM.
   * @returns {void}
   */
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.observer) this.observer.disconnect();
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}

if (typeof window !== 'undefined') {
  window.TypeFlowMetrics = TypeFlowMetrics;
}
