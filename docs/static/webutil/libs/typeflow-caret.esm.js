/*! typeflow-caret | MIT */
const t=/^\s+$/u;function e(t){return"undefined"!=typeof Intl&&Intl.Segmenter?Array.from(new Intl.Segmenter(void 0,{granularity:"grapheme"}).segment(t),t=>t.segment):Array.from(t)}function i(t){var e,i;"undefined"!=typeof window&&(null==(i=null==(e=window.TypeFlow)?void 0:e.stop)||i.call(e,t))}function n(t,e){const i=null==t?e:Number(t);return Number.isFinite(i)?Math.max(0,Math.min(Math.round(i),e)):e}class s{
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
constructor(t,s={}){var r,l,h,u,o,d,c;if(this.el="string"==typeof t?document.querySelector(t):t,!this.el)throw new Error("TypeFlowCaret: target element not found.");i(this.el),this.cursor=null!=(r=s.cursor)?r:"|",this.cursorBlink=null==(l=s.cursorBlink)||l,this.speed=null!=(h=s.speed)?h:40,this.respectReducedMotion=null==(u=s.respectReducedMotion)||u,this.units=e(null!=(d=null!=(o=s.text)?o:this.el.textContent)?d:""),this.index=n(null!=(c=s.position)?c:this.units.length,this.units.length),this._blinkInterval=null,this._activeInsert=null,this._render()}
/** Current plain-text content, cursor excluded. */get text(){return this.units.join("")}
/** Current caret index, in graphemes, from the start of the text. */get position(){return this.index}
/** Total number of graphemes in the current text. */get length(){return this.units.length}
/** Moves the caret to an absolute grapheme index, clamped to bounds. */jump(t){return this._stopInsert(),this.index=n(t,this.units.length),this._render(),this}
/** Moves the caret by a relative number of graphemes (positive = right, negative = left). */move(t){return this.jump(this.index+(Number(t)||0))}
/**
   * Deletes one grapheme at the caret.
   * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the character before the caret (Backspace); `'forward'` removes the character at/after it (Delete).
   */deleteChar(t="backward"){return this._stopInsert(),"forward"===t?this.index<this.units.length&&this.units.splice(this.index,1):this.index>0&&(this.units.splice(this.index-1,1),this.index-=1),this._render(),this}
/**
   * Deletes the whitespace-delimited word adjacent to the caret.
   * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the word (and any whitespace immediately before it) that precedes the caret; `'forward'` removes the word (and any whitespace immediately after it) that follows.
   */deleteWord(e="backward"){if(this._stopInsert(),"forward"===e){let e=this.index,i=!1;for(;e<this.units.length&&t.test(this.units[e]);)e+=1,i=!0;for(;e<this.units.length&&!t.test(this.units[e]);)e+=1;if(!i)for(;e<this.units.length&&t.test(this.units[e]);)e+=1;if(e===this.index)return this;this.units.splice(this.index,e-this.index)}else{let e=this.index;for(;e>0&&t.test(this.units[e-1]);)e-=1;for(;e>0&&!t.test(this.units[e-1]);)e-=1;if(e===this.index)return this;this.units.splice(e,this.index-e),this.index=e}return this._render(),this}
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
   */insert(t,i={}){var n,s,r;this._stopInsert();const l=e(null==t?"":String(t)),h=Math.max(0,Number(null!=(n=i.speed)?n:this.speed)||0),u=this.index;let o=!1,d=null,c=null;const a=t=>{var e,n;o||(o=!0,null!==d&&clearTimeout(d),this._activeInsert=null,t?null==(e=i.onComplete)||e.call(i,this.text):null==(n=i.onInterrupt)||n.call(i),null==c||c({completed:t,text:this.text}))},p={stop:()=>a(!1),promise:new Promise(t=>{c=t})};if(this._activeInsert=p,0===l.length)return a(!0),p;if(!0===(null!=(s=i.respectReducedMotion)?s:this.respectReducedMotion)&&"undefined"!=typeof window&&"function"==typeof window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return this.units.splice(u,0,...l),this.index=u+l.length,this._render(),a(!0),p;null==(r=i.onStart)||r.call(i);let f=0;const m=()=>{this.units.splice(u+f,0,l[f]),this.index=u+f+1,this._render(),f+=1,f>=l.length?a(!0):d=setTimeout(m,h)};return d=setTimeout(m,h),p}
/** Stops an in-flight `insert()`, if any. */stop(){return this._stopInsert(),this}
/** Stops any in-flight `insert()` and clears the blink interval. Call when done with a caret. */destroy(){return this._stopInsert(),null!==this._blinkInterval&&(clearInterval(this._blinkInterval),this._blinkInterval=null),this}_stopInsert(){var t;null==(t=this._activeInsert)||t.stop(),i(this.el)}_render(){var t,e;null!==this._blinkInterval&&(clearInterval(this._blinkInterval),this._blinkInterval=null);const i=this.units.slice(0,this.index).join(""),n=this.units.slice(this.index).join("");if(this.el.replaceChildren(document.createTextNode(i)),this.cursor){const i=function(t){const e=document.createElement("span");return e.className="tf-cursor",e.setAttribute("aria-hidden","true"),e.textContent=t,e}(this.cursor);if(this.el.appendChild(i),this.cursorBlink){let n=!0;this._blinkInterval=setInterval(()=>{n=!n,i.style.visibility=n?"visible":"hidden"},530),null==(e=(t=this._blinkInterval).unref)||e.call(t)}}this.el.appendChild(document.createTextNode(n))}}function r(t,e){return new s(t,e)}"undefined"!=typeof window&&(window.TypeFlowCaret=s,window.Caret=r);export{r as Caret,s as TypeFlowCaret};
//# sourceMappingURL=typeflow-caret.esm.js.map
