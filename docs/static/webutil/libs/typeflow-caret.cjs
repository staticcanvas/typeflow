/*! typeflow-caret | MIT */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).TypeflowCaret={})}(this,function(t){"use strict";const e=/^\s+$/u;function i(t){return"undefined"!=typeof Intl&&Intl.Segmenter?Array.from(new Intl.Segmenter(void 0,{granularity:"grapheme"}).segment(t),t=>t.segment):Array.from(t)}function n(t){var e,i;"undefined"!=typeof window&&(null==(i=null==(e=window.TypeFlow)?void 0:e.stop)||i.call(e,t))}function s(t,e){const i=null==t?e:Number(t);return Number.isFinite(i)?Math.max(0,Math.min(Math.round(i),e)):e}class r{
/**
     * @param {Element | string} target - Element or CSS selector.
     * @param {object} [config={}]
     * @param {string} [config.text] - Initial text. Defaults to the target's current text content.
     * @param {number} [config.position] - Initial caret index in graphemes. Defaults to the end of the text.
     * @param {string} [config.cursor='|'] - Cursor glyph. Empty string hides it.
     * @param {boolean} [config.cursorBlink=true]
     * @param {number} [config.speed=40] - Default ms per character for `insert()`.
     * @param {boolean} [config.respectReducedMotion=true]
     *
     * @example
     * const caret = new TypeFlowCaret('#terminal', { text: 'git commit -m "wip"' });
     * caret.jump(3).deleteWord('forward').insert('push');
     * // "git push -m "wip""
     */
constructor(t,e={}){var r,l,h,o,u,d,a;if(this.el="string"==typeof t?document.querySelector(t):t,!this.el)throw new Error("TypeFlowCaret: target element not found.");n(this.el),this.cursor=null!=(r=e.cursor)?r:"|",this.cursorBlink=null==(l=e.cursorBlink)||l,this.speed=null!=(h=e.speed)?h:40,this.respectReducedMotion=null==(o=e.respectReducedMotion)||o,this.units=i(null!=(d=null!=(u=e.text)?u:this.el.textContent)?d:""),this.index=s(null!=(a=e.position)?a:this.units.length,this.units.length),this._blinkInterval=null,this._activeInsert=null,this._render()}
/** Current plain-text content, cursor excluded. */get text(){return this.units.join("")}
/** Current caret index, in graphemes, from the start of the text. */get position(){return this.index}
/** Total number of graphemes in the current text. */get length(){return this.units.length}
/** Moves the caret to an absolute grapheme index, clamped to bounds. */jump(t){return this._stopInsert(),this.index=s(t,this.units.length),this._render(),this}
/** Moves the caret by a relative number of graphemes (positive = right, negative = left). */move(t){return this.jump(this.index+(Number(t)||0))}
/**
     * Deletes one grapheme at the caret.
     * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the character before the caret (Backspace); `'forward'` removes the character at/after it (Delete).
     */deleteChar(t="backward"){return this._stopInsert(),"forward"===t?this.index<this.units.length&&this.units.splice(this.index,1):this.index>0&&(this.units.splice(this.index-1,1),this.index-=1),this._render(),this}
/**
     * Deletes the whitespace-delimited word adjacent to the caret.
     * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the word (and any whitespace immediately before it) that precedes the caret; `'forward'` removes the word (and any whitespace immediately after it) that follows.
     */deleteWord(t="backward"){if(this._stopInsert(),"forward"===t){let t=this.index,i=!1;for(;t<this.units.length&&e.test(this.units[t]);)t+=1,i=!0;for(;t<this.units.length&&!e.test(this.units[t]);)t+=1;if(!i)for(;t<this.units.length&&e.test(this.units[t]);)t+=1;if(t===this.index)return this;this.units.splice(this.index,t-this.index)}else{let t=this.index;for(;t>0&&e.test(this.units[t-1]);)t-=1;for(;t>0&&!e.test(this.units[t-1]);)t-=1;if(t===this.index)return this;this.units.splice(t,this.index-t),this.index=t}return this._render(),this}
/**
     * Types `text` at the current caret position, one grapheme at a time,
     * shifting any following content to the right as it goes.
     *
     * @param {string} text
     * @param {object} [config={}]
     * @param {number} [config.speed] - Ms per character. Defaults to the speed passed to the constructor.
     * @param {boolean} [config.respectReducedMotion]
     * @param {() => void} [config.onStart]
     * @param {(text: string) => void} [config.onComplete]
     * @param {() => void} [config.onInterrupt]
     * @returns {{ stop: () => void, promise: Promise<{completed: boolean, text: string}> }}
     */insert(t,e={}){var n,s,r;this._stopInsert();const l=i(null==t?"":String(t)),h=Math.max(0,Number(null!=(n=e.speed)?n:this.speed)||0),o=this.index;let u=!1,d=null,a=null;const c=t=>{var i,n;u||(u=!0,null!==d&&clearTimeout(d),this._activeInsert=null,t?null==(i=e.onComplete)||i.call(e,this.text):null==(n=e.onInterrupt)||n.call(e),null==a||a({completed:t,text:this.text}))},p={stop:()=>c(!1),promise:new Promise(t=>{a=t})};if(this._activeInsert=p,0===l.length)return c(!0),p;if(!0===(null!=(s=e.respectReducedMotion)?s:this.respectReducedMotion)&&"undefined"!=typeof window&&"function"==typeof window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return this.units.splice(o,0,...l),this.index=o+l.length,this._render(),c(!0),p;null==(r=e.onStart)||r.call(e);let f=0;const m=()=>{this.units.splice(o+f,0,l[f]),this.index=o+f+1,this._render(),f+=1,f>=l.length?c(!0):d=setTimeout(m,h)};return d=setTimeout(m,h),p}
/** Stops an in-flight `insert()`, if any. */stop(){return this._stopInsert(),this}
/** Stops any in-flight `insert()` and clears the blink interval. Call when done with a caret. */destroy(){return this._stopInsert(),null!==this._blinkInterval&&(clearInterval(this._blinkInterval),this._blinkInterval=null),this}_stopInsert(){var t;null==(t=this._activeInsert)||t.stop(),n(this.el)}_render(){var t,e;null!==this._blinkInterval&&(clearInterval(this._blinkInterval),this._blinkInterval=null);const i=this.units.slice(0,this.index).join(""),n=this.units.slice(this.index).join("");if(this.el.replaceChildren(document.createTextNode(i)),this.cursor){const i=function(t){const e=document.createElement("span");return e.className="tf-cursor",e.setAttribute("aria-hidden","true"),e.textContent=t,e}(this.cursor);if(this.el.appendChild(i),this.cursorBlink){let n=!0;this._blinkInterval=setInterval(()=>{n=!n,i.style.visibility=n?"visible":"hidden"},530),null==(e=(t=this._blinkInterval).unref)||e.call(t)}}this.el.appendChild(document.createTextNode(n))}}function l(t,e){return new r(t,e)}"undefined"!=typeof window&&(window.TypeFlowCaret=r,window.Caret=l),t.Caret=l,t.TypeFlowCaret=r,Object.defineProperty(t,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=typeflow-caret.cjs.map
