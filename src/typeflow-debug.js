/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow Debug - Diagnostic Tracing and LogCAD Integration.
 * Provides lifecycle telemetry, animation step timings, event hooks, and structured
 * logger integration for TypeFlow applications.
 *
 * @module @staticcanvas/typeflow/debug
 */

export class TypeFlowDebug {
  static enabled = false;
  static options = {
    logcad: true,
    console: true,
    maxHistory: 200,
    traceFrames: false,
  };
  static history = [];
  static originalType = null;
  static originalErase = null;

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Enables diagnostic telemetry tracing across TypeFlow animation lifecycles.
   * @param {Object} [opts={}] - Configuration options for the debug session.
   * @returns {void}
   *
   * -------------
   *
   * @Properties
   * @param {boolean} [opts.logcad=true] - Whether to route logs through @staticcanvas/logcad if available.
   * @param {boolean} [opts.console=true] - Whether to output styled colored logs to the browser console.
   * @param {number}  [opts.maxHistory=200] - Maximum number of recent log entries to retain in memory.
   * @param {boolean} [opts.traceFrames=false] - Whether to log every individual frame render tick.
   *
   * -------------
   *
   * @example
   *
   * // Enable debugging with default settings
   * TypeFlowDebug.enable();
   *
   * // Enable with custom history size and disabled console output
   * TypeFlowDebug.enable({
   *   logcad: true,
   *   console: false,
   *   maxHistory: 500,
   * });
   */
  static enable(opts = {}) {
    TypeFlowDebug.options = { ...TypeFlowDebug.options, ...opts };
    TypeFlowDebug.enabled = true;
    TypeFlowDebug.log('info', 'TypeFlowDebug enabled', { options: TypeFlowDebug.options });
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Disables diagnostic tracing and halts active logging.
   * @returns {void}
   *
   * -------------
   *
   * @example
   * TypeFlowDebug.disable();
   */
  static disable() {
    TypeFlowDebug.enabled = false;
    TypeFlowDebug.log('info', 'TypeFlowDebug disabled');
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Internal logging bridge supporting @staticcanvas/logcad and styled console messages.
   * @param {'info' | 'warn' | 'error' | 'debug' | 'trace'} level - Severity level of the log entry.
   * @param {string} message - Human-readable summary of the event.
   * @param {Object} [data={}] - Contextual payload data to associate with the event.
   * @returns {void}
   *
   * -------------
   *
   * @Properties
   * @param {string} level - Severity level ('info', 'warn', 'error', 'debug', 'trace').
   * @param {string} message - The message text to record.
   * @param {Object} [data={}] - Arbitrary metadata object (timings, diffs, controllers).
   *
   * -------------
   *
   * @example
   * TypeFlowDebug.log('info', 'Sequence step completed', { step: 1, duration: 45 });
   * TypeFlowDebug.log('warn', 'Frame drop detected', { expectedMs: 16, actualMs: 34 });
   */
  static log(level, message, data = {}) {
    if (!TypeFlowDebug.enabled && level !== 'error') return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    TypeFlowDebug.history.push(entry);
    if (TypeFlowDebug.history.length > TypeFlowDebug.options.maxHistory) {
      TypeFlowDebug.history.shift();
    }

    // 1. Integration with @staticcanvas/logcad if available globally or via module
    if (TypeFlowDebug.options.logcad && typeof globalThis !== 'undefined' && globalThis.logcad) {
      try {
        const logger = globalThis.logcad.getLogger?.('TypeFlow') || globalThis.logcad;
        if (typeof logger[level] === 'function') {
          logger[level](message, data);
          return;
        }
      } catch (err) {
        // Fallback to console
      }
    }

    // 2. Structured fallback console output with CSS colors
    if (TypeFlowDebug.options.console && typeof console !== 'undefined') {
      const colors = {
        info: 'color: #38bdf8; font-weight: bold;',
        warn: 'color: #f59e0b; font-weight: bold;',
        error: 'color: #ef4444; font-weight: bold;',
        debug: 'color: #ff6b2b; font-weight: bold;',
        trace: 'color: #94a3b8; font-weight: normal;',
      };

      const tag = `%c[TypeFlow:${level.toUpperCase()}]`;
      const style = colors[level] || colors.info;

      if (Object.keys(data).length > 0) {
        console[level === 'trace' ? 'debug' : level] || console.log(tag, style, message, data);
      } else {
        console[level === 'trace' ? 'debug' : level] || console.log(tag, style, message);
      }
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Tracks a specific TypeFlow animation controller and logs lifecycle events upon resolution or rejection.
   * @param {Object} controller - Active TypeFlow controller instance.
   * @param {string} [label='Animation'] - Descriptive name for the tracked target.
   * @returns {Object} The passed-in controller for chaining.
   *
   * -------------
   *
   * @Properties
   * @param {Object} controller - The TypeFlow controller returned by TypeFlow.type() / TypeFlow.erase().
   * @param {Promise} controller.promise - The underlying completion promise.
   * @param {Function} controller.stop - Method to abort the animation.
   * @param {string} [label='Animation'] - Label displayed in log output.
   *
   * -------------
   *
   * @example
   * const ctrl = TypeFlow.type('#headline', 'Hello World');
   * TypeFlowDebug.trace(ctrl, 'Hero Headline');
   */
  static trace(controller, label = 'Animation') {
    if (!TypeFlowDebug.enabled || !controller) return controller;

    const start = performance.now();
    TypeFlowDebug.log('debug', `[${label}] Started animation`, { controller });

    if (controller.promise) {
      controller.promise.then(
        (res) => {
          const duration = (performance.now() - start).toFixed(2);
          TypeFlowDebug.log('info', `[${label}] Resolved (${duration}ms)`, res);
        },
        (err) => {
          const duration = (performance.now() - start).toFixed(2);
          TypeFlowDebug.log('error', `[${label}] Rejected (${duration}ms)`, err);
        }
      );
    }

    return controller;
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Returns a shallow copy of the recorded event history.
   * @returns {Array<Object>} List of history entry objects.
   *
   * -------------
   *
   * @example
   * const history = TypeFlowDebug.getHistory();
   * console.log('Total recorded events:', history.length);
   */
  static getHistory() {
    return [...TypeFlowDebug.history];
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Clears the current event history ring buffer.
   * @returns {void}
   *
   * -------------
   *
   * @example
   * TypeFlowDebug.clearHistory();
   */
  static clearHistory() {
    TypeFlowDebug.history = [];
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Exports recorded telemetry event history as a formatted JSON string.
   * @returns {string} Serialized JSON representation of debug history.
   *
   * -------------
   *
   * @example
   * const jsonReport = TypeFlowDebug.exportLog();
   * navigator.clipboard.writeText(jsonReport);
   */
  static exportLog() {
    return JSON.stringify(TypeFlowDebug.history, null, 2);
  }
}

if (typeof window !== 'undefined') {
  window.TypeFlowDebug = TypeFlowDebug;
}
