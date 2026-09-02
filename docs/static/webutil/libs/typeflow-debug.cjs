/*! typeflow-debug | MIT */
!function(o,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((o="undefined"!=typeof globalThis?globalThis:o||self).TypeflowDebug={})}(this,function(o){"use strict";var e=Object.defineProperty,t=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,r=(o,t,n)=>t in o?e(o,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[t]=n,i=(o,e)=>{for(var i in e||(e={}))n.call(e,i)&&r(o,i,e[i]);if(t)for(var i of t(e))l.call(e,i)&&r(o,i,e[i]);return o},s=(o,e,t)=>r(o,"symbol"!=typeof e?e+"":e,t);const a=class o{
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
static enable(e={}){o.options=i(i({},o.options),e),o.enabled=!0,o.log("info","TypeFlowDebug enabled",{options:o.options})}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Disables diagnostic tracing and halts active logging.
     * @returns {void}
     *
     * -------------
     *
     * @example
     * TypeFlowDebug.disable();
     */static disable(){o.enabled=!1,o.log("info","TypeFlowDebug disabled")}
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
     */static log(e,t,n={}){var l,r;if(!o.enabled&&"error"!==e)return;const i={timestamp:(new Date).toISOString(),level:e,message:t,data:n};if(o.history.push(i),o.history.length>o.options.maxHistory&&o.history.shift(),o.options.logcad&&"undefined"!=typeof globalThis&&globalThis.logcad)try{const o=(null==(r=(l=globalThis.logcad).getLogger)?void 0:r.call(l,"TypeFlow"))||globalThis.logcad;if("function"==typeof o[e])return void o[e](t,n)}catch(o){}if(o.options.console&&"undefined"!=typeof console){const o={info:"color: #38bdf8; font-weight: bold;",warn:"color: #f59e0b; font-weight: bold;",error:"color: #ef4444; font-weight: bold;",debug:"color: #ff6b2b; font-weight: bold;",trace:"color: #94a3b8; font-weight: normal;"},l=`%c[TypeFlow:${e.toUpperCase()}]`,r=o[e]||o.info;Object.keys(n).length>0?console["trace"===e?"debug":e]||console.log(l,r,t,n):console["trace"===e?"debug":e]||console.log(l,r,t)}}
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
     */static trace(e,t="Animation"){if(!o.enabled||!e)return e;const n=performance.now();return o.log("debug",`[${t}] Started animation`,{controller:e}),e.promise&&e.promise.then(e=>{const l=(performance.now()-n).toFixed(2);o.log("info",`[${t}] Resolved (${l}ms)`,e)},e=>{const l=(performance.now()-n).toFixed(2);o.log("error",`[${t}] Rejected (${l}ms)`,e)}),e}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Returns a shallow copy of the recorded event history.
     * @returns {Array<Object>} List of history entry objects.
     *
     * -------------
     *
     * @example
     * const history = TypeFlowDebug.getHistory();
     * console.log('Total recorded events:', history.length);
     */static getHistory(){return[...o.history]}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Clears the current event history ring buffer.
     * @returns {void}
     *
     * -------------
     *
     * @example
     * TypeFlowDebug.clearHistory();
     */static clearHistory(){o.history=[]}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Exports recorded telemetry event history as a formatted JSON string.
     * @returns {string} Serialized JSON representation of debug history.
     *
     * -------------
     *
     * @example
     * const jsonReport = TypeFlowDebug.exportLog();
     * navigator.clipboard.writeText(jsonReport);
     */static exportLog(){return JSON.stringify(o.history,null,2)}};s(a,"enabled",!1),s(a,"options",{logcad:!0,console:!0,maxHistory:200,traceFrames:!1}),s(a,"history",[]),s(a,"originalType",null),s(a,"originalErase",null);let c=a;"undefined"!=typeof window&&(window.TypeFlowDebug=c),o.TypeFlowDebug=c,Object.defineProperty(o,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=typeflow-debug.cjs.map
