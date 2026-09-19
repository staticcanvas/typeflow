/*! typeflow v0.34.3 | https://staticcanvas.gitlab.io/typeflow | MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Typeflow={})}(this,function(e){"use strict";var t=Object.defineProperty,n=Object.defineProperties,r=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable,i=e=>{throw TypeError(e)},s=(e,n,r)=>n in e?t(e,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[n]=r,c=(e,t)=>{for(var n in t||(t={}))o.call(t,n)&&s(e,n,t[n]);if(l)for(var n of l(t))a.call(t,n)&&s(e,n,t[n]);return e},u=(e,t)=>n(e,r(t)),d=(e,t,n)=>s(e,"symbol"!=typeof t?t+"":t,n),p=(e,t,n)=>t.has(e)||i("Cannot "+n),f=(e,t,n)=>(p(e,t,"read from private field"),n?n.call(e):t.get(e)),m=(e,t,n)=>t.has(e)?i("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),h=(e,t,n)=>(p(e,t,"access private method"),n),y=(e,t,n)=>new Promise((r,l)=>{var o=e=>{try{i(n.next(e))}catch(e){l(e)}},a=e=>{try{i(n.throw(e))}catch(e){l(e)}},i=e=>e.done?r(e.value):Promise.resolve(e.value).then(o,a);i((n=n.apply(e,t)).next())});
/**
   * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
   * @license MIT
   *
   * Zero dependencies. Safe by default (no innerHTML string concatenation).
   * Vanilla-first, with Intl.Segmenter support, multi-style reveals, and integrations for React, Vue, Svelte, Solid.js, Alpine.js, and Web Components.
   */
const g={matrix:"01X_#*~<>[]{}",ascii:"!@#$%^&*()_+-=[]{}|;:,.<>?","ascii-extended":"¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿",blocks:" ▂▃▄▅▆▇█░▒▓",binary:"01",hex:"0123456789ABCDEF",braille:"⠁⠃⠇⠏⠟⠿⡿⣿",runic:"ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯ",cyber:"!<>-_\\/[]{}—=+*^?#________"},b={cyberpunk:{typeStyle:"scramble",scrambleCharset:"matrix",scrambleRounds:2,speed:40,cursor:"|",cursorBlink:!0,audio:"synth"},terminal:{typeStyle:"char",speed:32,cursor:"█",cursorBlink:!0,audio:"mechanical"},writer:{naturalCadence:!0,speed:52,speedVariance:22,cursor:"|",cursorBlink:!0,audio:"mechanical"},matrix:{typeStyle:"scramble",scrambleCharset:"matrix",scrambleRounds:3,speed:30,cursor:"█",cursorBlink:!0,audio:"synth"},blocks:{typeStyle:"scramble",scrambleCharset:"blocks",scrambleRounds:2,speed:45,cursor:"█",cursorBlink:!0},subtle:{speed:45,cursor:"|",cursorBlink:!0,eraseStyle:"fade",respectReducedMotion:!0}},v={speed:50,delay:0,speedVariance:0,naturalCadence:!1,granularity:"grapheme",cursor:"|",cursorBlink:!0,html:!1,mode:"replace",direction:"left",typeStyle:"char",scrambleCharset:"cyber",scrambleGlyphs:"!<>-_\\/[]{}—=+*^?#________",scrambleRounds:2,audio:null,respectReducedMotion:!0},w=u(c({},v),{speed:25,cursorBlink:!1,eraseStyle:"end",preserveBaseline:!0}),x=new Set(["br","hr","img","input","wbr","area","base","col","embed","link","meta","source","track"]),C=new Set(["b","strong","i","em","mark","span","small","sub","sup","u","br","a","code","ul","ol","li"]),S={a:new Set(["href","title","target","rel"]),span:new Set(["class"]),mark:new Set(["class"]),"*":new Set(["class"])},T=new Set(["word-fade","float-in-top","float-in-bottom","float-in-left","float-in-right","zoom-in-space"]);let M=null;function A(e){if(!e)return;if("function"==typeof e){try{e()}catch(e){}return}const t="string"==typeof e?e:"mechanical";try{const e=function(){if("undefined"==typeof window)return null;const e=window.AudioContext||window.webkitAudioContext;if(!e)return null;if(!M)try{M=new e}catch(e){return null}return M&&"suspended"===M.state&&M.resume().catch(()=>{}),M}();if(!e)return;const n=e.currentTime,r=e.createOscillator(),l=e.createGain();"beep"===t?(r.type="sine",r.frequency.setValueAtTime(880,n),l.gain.setValueAtTime(.03,n),l.gain.exponentialRampToValueAtTime(.001,n+.035),r.connect(l),l.connect(e.destination),r.start(n),r.stop(n+.035)):"synth"===t?(r.type="sawtooth",r.frequency.setValueAtTime(340,n),r.frequency.exponentialRampToValueAtTime(140,n+.04),l.gain.setValueAtTime(.025,n),l.gain.exponentialRampToValueAtTime(.001,n+.04),r.connect(l),l.connect(e.destination),r.start(n),r.stop(n+.04)):(r.type="triangle",r.frequency.setValueAtTime(1100+300*Math.random(),n),l.gain.setValueAtTime(.035,n),l.gain.exponentialRampToValueAtTime(.001,n+.02),r.connect(l),l.connect(e.destination),r.start(n),r.stop(n+.02))}catch(e){}}function E(e){try{e.stop()}catch(e){}}const k=new WeakMap;function F(e,t="grapheme"){var n;const r=null!=(n=e.textContent)?n:"";let l=k.get(e);return l&&l.text===r||(l={text:r,values:new Map},k.set(e,l)),l.values.has(t)||l.values.set(t,function(e,t="grapheme"){if("undefined"!=typeof Intl&&Intl.Segmenter){const n=new Intl.Segmenter(void 0,{granularity:t});return Array.from(n.segment(e),e=>e.segment)}if("word"===t){return e.match(/\s+|\S+/g)||[e]}return Array.from(e)}(r,t)),l.values.get(t)}function N(e){const t=e.trim().toLowerCase();return!t.startsWith("javascript:")&&!t.startsWith("data:")&&!t.startsWith("vbscript:")}function O(e,t,n,r){const l=document.createDocumentFragment();if(t)return l.appendChild(document.createTextNode(e)),l;const o=document.createElement("template");o.innerHTML=e;const a=(e,t)=>{e.childNodes.forEach(e=>{var l;if(e.nodeType===Node.TEXT_NODE)t.appendChild(document.createTextNode(null!=(l=e.textContent)?l:""));else if(e.nodeType===Node.ELEMENT_NODE){const l=function(e,t,n){var r,l;const o=e.tagName.toLowerCase();if(!t.has(o))return null;const a=document.createElement(o),i=null!=(r=n[o])?r:new Set,s=null!=(l=n["*"])?l:new Set;for(const t of Array.from(e.attributes)){const e=t.name.toLowerCase();e.startsWith("on")||(i.has(e)||s.has(e))&&("href"!==e&&"src"!==e||N(t.value))&&a.setAttribute(e,t.value)}return"a"===o&&"_blank"===a.getAttribute("target")&&a.setAttribute("rel","noopener noreferrer"),a}(e,n,r);l?(t.appendChild(l),a(e,l)):a(e,t)}})};return a(o.content,l),l}function I(e,t="grapheme"){if(3===e.nodeType)return F(e,t).length;let n=0;return e.childNodes.forEach(e=>n+=I(e,t)),n}function L(e,t,n,r="grapheme",l={}){var o,a;if(3===e.nodeType){const i=F(e,r),s=i.length;if(n<=0||t>=s)return{clone:null,start:Math.max(0,t-s),end:Math.max(0,n-s)};const c=Math.max(0,t),u=Math.min(s,n),d=(null==e?void 0:e.ownerDocument)||("undefined"!=typeof document?document:null);if(!d)return{clone:null,start:t,end:n};if((null==l?void 0:l.scrambleActive)&&u>c&&(null==(o=i[u-1])?void 0:o.trim())){const e=d.createDocumentFragment();u-1>c&&e.appendChild(d.createTextNode(i.slice(c,u-1).join("")));const r=d.createElement("span");return r.className="tf-scramble",l.scrambleColor&&(r.style.color=l.scrambleColor),l.scrambleGradient&&(r.style.backgroundImage=l.scrambleGradient,r.style.webkitBackgroundImage=l.scrambleGradient,r.style.webkitBackgroundClip="text",r.style.backgroundClip="text",r.style.webkitTextFillColor="transparent",r.style.display="inline-block"),r.textContent=(a=l.scrambleGlyphs)[Math.floor(Math.random()*a.length)],e.appendChild(r),{clone:e,start:Math.max(0,t-s),end:Math.max(0,n-s)}}const p="number"==typeof l.trailFade?l.trailFade:"number"==typeof l.trailingFadeLength?l.trailingFadeLength:l.trailFade?4:0;if(p>0&&u-c>=1&&!l.isComplete){const e=d.createDocumentFragment(),r=Math.max(c,u-p);r>c&&e.appendChild(d.createTextNode(i.slice(c,r).join("")));const o=u-r,a="number"==typeof l.trailingFadeMinOpacity?l.trailingFadeMinOpacity:"number"==typeof l.trailMinOpacity?l.trailMinOpacity:.18;for(let t=0;t<o;t++){const n=r+t,l=d.createElement("span");l.className="tf-trail";const s=a+(1-a)*(o<=1?1:(t+1)/o);l.style.opacity=s.toFixed(3),l.textContent=i[n],e.appendChild(l)}return{clone:e,start:Math.max(0,t-s),end:Math.max(0,n-s)}}const f=i.slice(c,u).join("");return{clone:d.createTextNode(f),start:Math.max(0,t-s),end:Math.max(0,n-s)}}if(1===e.nodeType){const o=e,a=o.tagName.toLowerCase();if(x.has(a))return n<=0?{clone:null,start:t,end:n}:{clone:o.cloneNode(!1),start:t,end:n};const i=o.cloneNode(!1);let s=t,c=n,u=!1;return e.childNodes.forEach(e=>{const t=L(e,s,c,r,l);t.clone&&(i.appendChild(t.clone),u=!0),s=t.start,c=t.end}),{clone:u?i:null,start:s,end:c}}return{clone:null,start:t,end:n}}function _(e){const t=q(e);if(!t){const t=null===e?"null":void 0===e?"undefined":String(e);throw new Error(`TypeFlow: target element not found (${t})`)}return t}function q(e){return"string"==typeof e?document.querySelector(e):e}function P(e){const t=String(null!=e?e:"left-to-right").toLowerCase();return"right-to-left"===t||"reverse"===t||"rtl"===t?"right-to-left":"random"===t||"shuffle"===t?"random":"left-to-right"}function B(e,t,n){const r=Array.from({length:e},(e,t)=>t);if("right-to-left"===P(t))return r.reverse();if("random"!==P(t))return r;const l=function(e){if(null==e)return Math.random;const t=String(e);let n=2166136261;for(let e=0;e<t.length;e+=1)n^=t.charCodeAt(e),n=Math.imul(n,16777619);return()=>{n+=1831565813;let e=n;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}}(n);for(let e=r.length-1;e>0;e-=1){const t=Math.floor(l()*(e+1));[r[e],r[t]]=[r[t],r[e]]}return r}function D(e,t="opacity",n="word-fade"){const r=(null==e?void 0:e.ownerDocument)||("undefined"!=typeof document?document:null);if(!r)return{fragment:null,words:[]};const l=r.createDocumentFragment(),o=[],a="word-fade"!==n,i=(e,n)=>{e.childNodes.forEach(e=>{var l;if(e.nodeType===Node.TEXT_NODE)for(const i of function(e){var t;return"undefined"!=typeof Intl&&Intl.Segmenter?Array.from(new Intl.Segmenter(void 0,{granularity:"word"}).segment(e)):(null!=(t=e.match(/\s+|\S+/g))?t:[]).map(e=>({segment:e,isWordLike:!/^\s+$/u.test(e)}))}(null!=(l=e.textContent)?l:"")){if(/^\s+$/u.test(i.segment)){n.appendChild(r.createTextNode(i.segment));continue}if(!1===i.isWordLike&&o.length>0&&o.at(-1).parentNode===n){o.at(-1).appendChild(r.createTextNode(i.segment));continue}const e=r.createElement("span");e.className="tf-word-fade",e.dataset.tfWordIndex=String(o.length),e.textContent=i.segment,e.style.display=a?"inline-block":"inline",e.style.opacity="0",e.style.willChange=a?"opacity, transform":"opacity",e.setAttribute("aria-hidden","true"),"placeholder"===t&&(e.style.visibility="hidden"),o.push(e),n.appendChild(e)}else if(e.nodeType===Node.ELEMENT_NODE){const t=e.cloneNode(!1);n.appendChild(t),i(e,t)}})};return i(e,l),{fragment:l,words:o}}function j(){return"undefined"!=typeof window&&"function"==typeof window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}function R(e,t=!1){const n=document.createElement("span");return n.className="tf-cursor",n.setAttribute("aria-hidden","true"),n.textContent=e,t&&(n.style.visibility="hidden"),n}const W=new class{constructor(){d(this,"active",new Map),d(this,"baselines",new WeakMap),d(this,"cursorIntervals",new Map)}clearCursorInterval(e){const t=this.cursorIntervals.get(e);t&&(clearInterval(t),this.cursorIntervals.delete(e))}animate(e,t,n,r,l,o,a,i={}){var s,c,u,d,p,f,m,h,y;this.clearCursorInterval(e),null==(s=this.active.get(e))||s.stop(),r.ariaLive&&e.setAttribute("aria-live",r.ariaLive);const b=null!=(c=i.prefix)?c:[],w=null!=(u=i.blinkOnFinish)&&u,x=o>=l?1:-1,C=Math.max(0,Number(null!=(d=r.speed)?d:v.speed)||0),S=null!=(p=r.granularity)?p:v.granularity,T="scramble"===r.typeStyle||"scramble"===r.eraseStyle,M=(k=r.scrambleGlyphs,(N=null!=(f=r.scrambleCharset)?f:r.scramblePreset)&&g[N]?g[N]:"string"==typeof k&&g[k]?g[k]:null!=k?k:g.cyber);var k,N;let O=!1,I=null,_=null;const q=!0===i.plainText&&1===x&&"left"===r.direction&&!T&&"fade-trail"!==r.typeStyle&&void 0===r.trailFade&&void 0===r.trailingFadeLength?F(t.firstChild,S):null,P=q?document.createTextNode(""):null;let B=null,D=0;const W=()=>{null!==I&&clearTimeout(I),this.clearCursorInterval(e),I=null},$=(l,a,s=!1,c=!1)=>{var u,d,p,f,m;if(P&&!s)return l===D+1?P.data+=null!=(u=q[D])?u:"":l!==D&&(P.data=q.slice(0,l).join("")),D=l,P.parentNode||e.replaceChildren(...b,P),void(a?(B||(B=R(a,c)),B.textContent=a,B.style.visibility=c?"hidden":"visible",B.parentNode||e.appendChild(B)):(null==B?void 0:B.parentNode)&&B.remove());const h=function(e,t,n,r,l){if(l){if("start"===r)return{start:t-e,end:t};if("center"===r){const n=Math.max(0,Math.floor((t-e)/2));return{start:n,end:Math.min(t,n+e)}}return{start:0,end:e}}if("right"===n)return{start:t-e,end:t};if("center"===n){const n=Math.max(0,Math.floor((t-e)/2));return{start:n,end:Math.min(t,n+e)}}return{start:0,end:e}}(l,n,null!=(d=r.direction)?d:"left",null!=(p=r.eraseStyle)?p:"end",null!=(f=i.isErasing)&&f),y=null!==r.trailFade&&void 0!==r.trailFade||null!==r.trailingFadeLength&&void 0!==r.trailingFadeLength||"fade-trail"===r.typeStyle||"fade-trail"===r.eraseStyle,g="number"==typeof r.trailFade?r.trailFade:"number"==typeof r.trailingFadeLength?r.trailingFadeLength:y?null!=(m=r.trailingFadeLength)?m:4:0,v="number"==typeof r.trailingFadeMinOpacity?r.trailingFadeMinOpacity:"number"==typeof r.trailMinOpacity?r.trailMinOpacity:.18;e.replaceChildren(...b,function(e,t,n,r="grapheme",l={}){const o=(null==e?void 0:e.ownerDocument)||("undefined"!=typeof document?document:null);if(!o)return null;const a=o.createDocumentFragment();let i=t,s=n;return e.childNodes.forEach(e=>{const t=L(e,i,s,r,l);t.clone&&a.appendChild(t.clone),i=t.start,s=t.end}),a}(t,h.start,h.end,S,{scrambleActive:s,scrambleGlyphs:M,scrambleColor:r.scrambleColor,scrambleGradient:r.scrambleGradient,trailFade:g,trailingFadeLength:g,trailingFadeMinOpacity:v,isComplete:l===o&&!s})),a&&e.appendChild(R(a,c))},V=t=>{var n,l,i;if(!O){if(O=!0,W(),this.active.delete(e),t){if(w&&r.cursor&&r.cursorBlink){let t=!0;$(o,r.cursor,!1,!1);const l=setInterval(()=>{t=!t,$(o,r.cursor,!1,!t)},530);null==(n=l.unref)||n.call(l),this.cursorIntervals.set(e,l)}else $(o,"",!1);null==(l=r.onComplete)||l.call(r,a)}else this.clearCursorInterval(e),E(r.audio),null==(i=r.onInterrupt)||i.call(r);null==_||_({completed:t,text:a})}},z={stop:()=>V(!1),promise:new Promise(e=>{_=e})};this.active.set(e,z);if(!0===r.respectReducedMotion&&j())return V(!0),z;let G=0;const X=null!=(m=r.scrambleRounds)?m:v.scrambleRounds,Y=e=>{var t,n;if(r.audio&&A(r.audio),T&&G<X&&e!==o)return $(e,null!=(t=r.cursor)?t:"",!0),G++,void(I=setTimeout(()=>Y(e),Math.max(10,C/2)));if(G=0,$(e,null!=(n=r.cursor)?n:"",!1),e===o)return void V(!0);const l=r.speedVariance?(2*Math.random()-1)*r.speedVariance:0,i=r.naturalCadence?function(e,t){if(t<=0||t>e.length)return 0;const n=e[t-1];return"."===n||"!"===n||"?"===n?220:","===n||";"===n||":"===n?110:" "===n?40:0}(a,e):0,s=Math.max(0,C+l+i);I=setTimeout(()=>Y(e+x),s)};return null==(h=r.onStart)||h.call(r),I=setTimeout(()=>Y(l),null!=(y=r.delay)?y:0),z}animateWordMotion(e,t,n,r={}){var l,o,a,i,s,c,u,d;this.clearCursorInterval(e),null==(l=this.active.get(e))||l.stop(),n.ariaLive&&e.setAttribute("aria-live",n.ariaLive);const p=null!=(o=r.prefix)?o:[],f=!0===r.isErasing,m=null!=(a=r.motionKind)?a:"word-fade",h="placeholder"===n.wordLayout?"placeholder":"opacity",y=Math.max(0,Number(null!=(i=n.wordFadeDuration)?i:280)||0),g=Math.max(0,Number(null!=(c=null!=(s=n.wordStagger)?s:n.speed)?c:70)||0),b=function(e,t){var n,r,l;const o=Math.max(0,Number(null!=(n=t.wordMotionDistance)?n:24)||0),a=Math.max(0,Number(null!=(r=t.wordMotionDepth)?r:160)||0),i=Math.min(1,Math.max(.01,Number(null!=(l=t.wordMotionScale)?l:.82)||.82));switch(e){case"float-in-top":return{hidden:`translateY(-${o}px)`,visible:"translateY(0)"};case"float-in-bottom":return{hidden:`translateY(${o}px)`,visible:"translateY(0)"};case"float-in-left":return{hidden:`translateX(-${o}px)`,visible:"translateX(0)"};case"float-in-right":return{hidden:`translateX(${o}px)`,visible:"translateX(0)"};case"zoom-in-space":return{hidden:`translateZ(-${a}px) scale(${i})`,visible:"translateZ(0) scale(1)"};default:return null}}(m,n),v="zoom-in-space"===m,{fragment:w,words:x}=D(t,h,m),C=B(x.length,n.wordOrder,n.wordSeed);C.forEach((e,t)=>{x[e].dataset.tfWordOrder=String(t)});const S=new Set;let T=null,M=!1,k=null;const F="string"==typeof n.wordMotionEasing&&n.wordMotionEasing.trim()?n.wordMotionEasing.trim():"ease";x.forEach(e=>{e.style.transition=b?`opacity ${y}ms ${F}, transform ${y}ms ${F}`:`opacity ${y}ms ${F}`,b&&(e.style.transform=b.hidden),f&&(e.style.opacity="1",e.style.visibility="visible",e.removeAttribute("aria-hidden"),b&&(e.style.transform=b.visible))}),v&&(e.style.perspective=`${Math.max(0,Number(null!=(u=n.wordMotionPerspective)?u:600)||0)}px`,e.style.transformStyle="preserve-3d"),e.replaceChildren(...p,w),e.setAttribute("aria-busy","true");const N=(e,t)=>{const n=setTimeout(()=>{S.delete(n),e()},t);S.add(n)},O=()=>{var t;if(!n.cursor)return;const r=R(n.cursor);if(e.appendChild(r),n.cursorBlink){let n=!0;const l=setInterval(()=>{n=!n,r.style.visibility=n?"visible":"hidden"},530);null==(t=l.unref)||t.call(l),this.cursorIntervals.set(e,l)}},I=l=>{var o,a,i,s,c;M||(M=!0,S.forEach(e=>clearTimeout(e)),S.clear(),null!==T&&"function"==typeof cancelAnimationFrame&&cancelAnimationFrame(T),T=null,this.active.delete(e),e.removeAttribute("aria-busy"),v&&(e.style.removeProperty("perspective"),e.style.removeProperty("transform-style")),l?f?(e.replaceChildren(...p),null==(o=n.onComplete)||o.call(n,"")):(e.replaceChildren(...p,t.cloneNode(!0)),O(),null==(i=n.onComplete)||i.call(n,null!=(a=r.resultText)?a:"")):(e.replaceChildren(...p,t.cloneNode(!0)),E(n.audio),null==(s=n.onInterrupt)||s.call(n)),null==k||k({completed:l,text:f?"":null!=(c=r.resultText)?c:""}))},L={stop:()=>I(!1),promise:new Promise(e=>{k=e})};if(this.active.set(e,L),!0===n.respectReducedMotion&&j())return I(!0),L;null==(d=n.onStart)||d.call(n);return N(()=>{T=requestAnimationFrame(()=>{if(T=null,0===x.length)return void I(!0);let e=0;const t=()=>{const r=x[C[e]];n.audio&&A(n.audio),f?(r.style.opacity="0",b&&(r.style.transform=b.hidden),r.setAttribute("aria-hidden","true")):(r.style.visibility="visible",r.removeAttribute("aria-hidden"),r.style.opacity="1",b&&(r.style.transform=b.visible)),e+=1,e<x.length?N(t,g):N(()=>I(!0),y)};t()})},Math.max(0,Number(n.delay)||0)),L}eraseFade(e,t,n,r){var l,o;this.clearCursorInterval(e),null==(l=this.active.get(e))||l.stop();const a=document.createElement("span");t.forEach(e=>a.appendChild(e)),e.replaceChildren(...n,a);const i=null!=(o=r.duration)?o:250;let s=!1,c=null,u=null;const d=t=>{var l,o;s||(s=!0,null!==c&&clearTimeout(c),this.clearCursorInterval(e),this.active.delete(e),t?(e.replaceChildren(...n),null==(l=r.onComplete)||l.call(r,"")):(E(r.audio),null==(o=r.onInterrupt)||o.call(r)),null==u||u({completed:t,text:""}))},p={stop:()=>d(!1),promise:new Promise(e=>{u=e})};return this.active.set(e,p),r.respectReducedMotion&&j()?(d(!0),p):(requestAnimationFrame(()=>{a.style.transition=`opacity ${i}ms ease`,a.style.opacity="0"}),c=setTimeout(()=>d(!0),i),p)}instantClear(e,t,n){var r,l;return this.clearCursorInterval(e),null==(r=this.active.get(e))||r.stop(),e.replaceChildren(...t),null==(l=n.onComplete)||l.call(n,""),{stop:()=>{},promise:Promise.resolve({completed:!0,text:""})}}
/**
     * Types text or sanitized HTML into the target element character by character
     * (or word by word when `typeStyle: 'word'`).
     *
     * Any animation currently running on `target` is stopped before the new one
     * starts. If `prefers-reduced-motion: reduce` is active and
     * `respectReducedMotion` is `true` (the default), the full text is rendered
     * immediately without animation.
     *
     * @param {Element | string} target
     *   A DOM element or a CSS selector string resolved via `document.querySelector`.
     * @param {string} text
     *   The text or HTML string to type. When `config.html` is `false` (default)
     *   the string is treated as plain text and no parsing is performed.
     * @param {Partial<TypeFlowConfig>} [config={}]
     *   Optional configuration overrides. See {@link TypeFlowConfig} for the full
     *   option set. Merged with {@link TYPE_DEFAULTS}.
     * @returns {TypeFlowController}
     *   A controller object with a `stop()` method and a `promise` that resolves
     *   to `{ completed: boolean, text: string }`.
     *
     * @example
     * const controller = TypeFlow.type('#headline', 'Hello <strong>World</strong>', {
     *   html: true,
     *   speed: 45,
     *   cursor: '|',
     *   cursorBlink: true,
     *   onComplete: (text) => console.log('Done:', text),
     * });
     *
     * // Abort mid-animation
     * button.addEventListener('click', () => controller.stop());
     */type(e,t,n={}){var r,l;const o=_(e),a=c(c({},v),n);Object.prototype.hasOwnProperty.call(n,"scrambleGlyphs")&&(a.scrambleCharset=void 0),a.direction=function(e){if(!e)return"left";const t=String(e).toLowerCase();return"right"===t||"rtl"===t||"end"===t||"reverse"===t?"right":"center"===t||"middle"===t||"expand"===t||"both"===t?"center":"left"}(a.direction),a.typeStyle=function(e){if(!e)return"char";const t=String(e).toLowerCase();return"word"===t||"words"===t||"stream"===t?"word":"scramble"===t||"matrix"===t||"decrypt"===t||"cyber"===t||"random"===t?"scramble":"fade-trail"===t||"trail"===t||"trailing"===t||"soft"===t?"fade-trail":"word-fade"===t||"fade-words"===t||"wordfade"===t?"word-fade":"float-in-top"===t||"float-top"===t||"float-down"===t?"float-in-top":"float-in-bottom"===t||"float-bottom"===t||"float-up"===t?"float-in-bottom":"float-in-left"===t||"float-left"===t?"float-in-left":"float-in-right"===t||"float-right"===t?"float-in-right":"zoom-in-space"===t||"zoom-in"===t||"zoom-space"===t?"zoom-in-space":"char"}(a.typeStyle),"word"===a.typeStyle&&(a.granularity="word");const i=new Set([...C,...null!=(r=a.allowedTags)?r:[]]),s=c({},S);if(a.allowedAttributes)for(const[e,t]of Object.entries(a.allowedAttributes))s[e]=new Set([...null!=(l=s[e])?l:[],...t]);let u=null==t?"":String(t);a.html&&a.sanitizer&&(u=a.sanitizer(u));const d=O(u,!a.html,i,s),p=I(d,a.granularity),f="append"===a.mode?Array.from(o.childNodes):[];return"append"===a.mode?this.baselines.set(o,f):this.baselines.delete(o),T.has(a.typeStyle)?this.animateWordMotion(o,d,a,{prefix:f,resultText:u,isErasing:!1,motionKind:a.typeStyle}):this.animate(o,d,p,a,0,p,u,{prefix:f,blinkOnFinish:!0,isErasing:!1,plainText:!a.html})}erase(e,t={}){var n;const r=_(e),l=c(c({},w),t);Object.prototype.hasOwnProperty.call(t,"scrambleGlyphs")&&(l.scrambleCharset=void 0),l.eraseStyle=function(e){if(!e)return"end";const t=String(e).toLowerCase();return"start"===t||"erosion"===t||"left"===t||"forward"===t?"start":"center"===t||"middle"===t||"shrink"===t||"split"===t?"center":"scramble"===t||"matrix"===t||"decrypt"===t||"cyber"===t||"random"===t?"scramble":"fade-trail"===t||"trail"===t||"trailing"===t||"soft"===t?"fade-trail":"fade"===t||"dissolve"===t||"crossfade"===t?"fade":"word-fade"===t||"fade-words"===t||"wordfade"===t?"word-fade":"float-in-top"===t||"float-top"===t||"float-down"===t?"float-in-top":"float-in-bottom"===t||"float-bottom"===t||"float-up"===t?"float-in-bottom":"float-in-left"===t||"float-left"===t?"float-in-left":"float-in-right"===t||"float-right"===t?"float-in-right":"zoom-in-space"===t||"zoom-in"===t||"zoom-space"===t?"zoom-in-space":"instant"===t||"clear"===t||"reset"===t||"immediate"===t?"instant":"end"}(l.eraseStyle);const o=l.preserveBaseline&&null!=(n=this.baselines.get(r))?n:[],a=Array.from(r.childNodes),i=o.length?a.filter(e=>!o.includes(e)):a;if("instant"===l.eraseStyle)return this.instantClear(r,o,l);if("fade"===l.eraseStyle)return this.eraseFade(r,i,o,l);const s=document.createDocumentFragment();i.forEach(e=>s.appendChild(e.cloneNode(!0)));const u=I(s,l.granularity);return T.has(l.eraseStyle)?this.animateWordMotion(r,s,l,{prefix:o,isErasing:!0,motionKind:l.eraseStyle}):this.animate(r,s,u,l,u,0,"",{prefix:o,isErasing:!0})}
/**
     * Smart Diff Morphing: compares the existing text content of `target` with `nextText`,
     * erases only the mismatched trailing characters, and types the replacement text.
     *
     * @param {Element | string} target - Target element or CSS selector string.
     * @param {string} nextText - Destination text.
     * @param {Partial<TypeFlowConfig>} [options={}] - Animation options.
     * @returns {Promise<{ completed: boolean, text: string }>}
     */morph(e,t,n={}){var r;const l=_(e),o=null!=(r=l.textContent)?r:"",a=null==t?"":String(t);let i=0;const s=Math.min(o.length,a.length);for(;i<s&&o[i]===a[i];)i++;const d=o.length-i,p=a.slice(i),f=[];return d>0&&f.push($.call(()=>{var e,t;const r=document.createDocumentFragment();r.appendChild(document.createTextNode(o));const a=o.length;return this.animate(l,r,a,u(c(c({},w),n),{speed:null!=(t=null!=(e=n.eraseSpeed)?e:n.speed)?t:w.speed}),a,i,o.slice(0,i),{prefix:[],isErasing:!0}).promise})),p.length>0&&f.push($.type(l,p,u(c({},n),{mode:"append"}))),this.sequence(f)}
/**
     * Creates a streaming chunk consumer for real-time LLM token ingestion.
     *
     * @param {Element | string} target - Target element or CSS selector.
     * @param {Partial<TypeFlowConfig> & { onChunk?: (chunk: string, fullText: string) => void }} [options={}]
     * @returns {{ push: (chunk: string) => void, stop: () => void, clear: () => void }}
     */stream(e,t={}){const n=_(e);let r=[],l=!1;const o=()=>{if(0===r.length)return void(l=!1);l=!0;const e=r.shift();this.type(n,e,u(c({},t),{mode:"append",onComplete:n=>{var r;null==(r=t.onChunk)||r.call(t,e,n),o()}}))};return{push:e=>{null!=e&&String(e).length>0&&(r.push(String(e)),l||o())},stop:()=>{r=[],this.stop(n),l=!1},clear:()=>{r=[],this.stop(n),l=!1,n.replaceChildren()}}}
/**
     * Returns a complete pre-configured options object for common typewriter profiles.
     *
     * @param {'cyberpunk' | 'terminal' | 'writer' | 'matrix' | 'blocks' | 'subtle'} name
     * @param {Partial<TypeFlowConfig>} [overrides={}]
     * @returns {TypeFlowConfig}
     */preset(e,t={}){var n;const r=null!=(n=b[e])?n:b.writer;return c(c({},r),t)}
/**
     * Executes an ordered list of animation steps sequentially, waiting for each
     * step to complete before advancing to the next one.
     *
     * Supported step kinds (created via the {@link seq} helper):
     * - `seq.type(target, text, config)` — Types text into a target element.
     * - `seq.erase(target, config)`      — Erases content from a target element.
     * - `seq.pause(duration)`            — Waits `duration` milliseconds.
     * - `seq.call(fn)`                   — Invokes an async or sync function.
     * - `seq.visible(target, threshold)` — Waits until the target is visible.
     *
     * If any step's animation is interrupted (via `controller.stop()`), the
     * entire sequence halts immediately.
     *
     * @param {Array<SequenceStep>} steps
     *   An ordered array of step descriptors. Use the {@link seq} helper to
     *   construct them.
     * @param {{ repeat?: number, target?: Element | string }} [seqConfig={}]
     *   Optional sequence-level configuration.
     *   - `repeat` — Number of times to repeat the full sequence. Use `Infinity`
     *     for indefinite repetition. Defaults to `1`.
     *   - `target` — A default target element applied to steps that do not
     *     specify one individually.
     * @returns {TypeFlowController}
     *   A controller with `stop()` and a `promise` resolving to
     *   `{ completed: boolean, text: '' }`.
     *
     * @example
     * import { TypeFlow, seq } from '@staticcanvas/typeflow';
     *
     * TypeFlow.sequence([
     *   seq.type('#output', 'Step 1 complete.'),
     *   seq.pause(600),
     *   seq.call(() => triggerSoundEffect()),
     *   seq.erase('#output'),
     *   seq.type('#output', 'Step 2 starting...'),
     * ], { repeat: 1 });
     */sequence(e,t={}){if(!Array.isArray(e)||0===e.length)return{stop:()=>{},promise:Promise.resolve({completed:!0,text:""})};let n=!1,r=null,l=null,o=null;const a=e=>{var n;const r=null!=(n=e.target)?n:t.target;if(!r)throw new Error("TypeFlow: a sequence step is missing a target, and no default `target` was set on the sequence config.");return r},i={stop:()=>{n||(n=!0,null==r||r.stop(),null==l||l(),null==o||o())},promise:null},s=()=>y(this,null,function*(){for(const t of e){if(n)return!1;if("type"===t.kind){if(r=this.type(a(t),t.text,t.config),!(yield r.promise).completed)return!1}else if("erase"===t.kind){if(r=this.erase(a(t),t.config),!(yield r.promise).completed)return!1}else if("pause"===t.kind){const e=yield new Promise(e=>{const n=setTimeout(()=>e(!0),t.duration);l=()=>{clearTimeout(n),e(!1)}});if(l=null,!e)return!1}else if("visible"===t.kind){const e=_(a(t)),n=yield new Promise(n=>{var r;if("undefined"==typeof IntersectionObserver)return void n(!0);const l=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(l.disconnect(),n(!0))},{threshold:null!=(r=t.threshold)?r:.1});o=()=>{l.disconnect(),n(!1)},l.observe(e)});if(o=null,!n)return!1}else if("call"===t.kind)try{yield t.fn()}catch(e){console.error("TypeFlow: error in seq.call step:",e)}if(n)return!1}return!0});return i.promise=(()=>y(this,null,function*(){var e;const n=null!=(e=t.repeat)?e:1;for(let e=0;n===1/0||e<n;e++)if(!(yield s()))return{completed:!1,text:""};return{completed:!0,text:""}}))(),i}
/**
     * Cyclically types and erases an array of strings in sequence.
     *
     * Internally delegates to {@link TypeFlowEngine#sequence}, constructing a
     * step list of: `type → pause (holdDuration) → erase → pause (pauseBetween)`
     * for each word.
     *
     * @param {Element | string} target
     *   A DOM element or a CSS selector string.
     * @param {string[]} words
     *   An ordered array of strings to rotate through.
     * @param {RotateConfig} [config={}]
     *   Optional rotation configuration.
     * @param {Partial<TypeFlowConfig>} [config.typeConfig={}]
     *   Config options applied to every `type` step.
     * @param {Partial<TypeFlowConfig>} [config.eraseConfig={}]
     *   Config options applied to every `erase` step.
     * @param {number} [config.holdDuration=1200]
     *   Milliseconds to hold each fully-typed word before erasing.
     * @param {number} [config.pauseBetween=200]
     *   Milliseconds to wait after erasing before typing the next word.
     * @param {number | typeof Infinity} [config.repeat=Infinity]
     *   Number of full rotation cycles. Use `Infinity` for indefinite rotation.
     * @returns {TypeFlowController}
     *   A controller with `stop()` and a resolving `promise`.
     *
     * @example
     * TypeFlow.rotate('#rotating', ['Fast', 'Lightweight', 'Reliable'], {
     *   holdDuration: 1200,
     *   pauseBetween: 200,
     *   repeat: Infinity,
     * });
     */rotate(e,t,n={}){const{typeConfig:r={},eraseConfig:l={},holdDuration:o=1200,pauseBetween:a=200,repeat:i=1/0}=n,s=[];return t.forEach(t=>{s.push({kind:"type",target:e,text:t,config:r}),s.push({kind:"pause",duration:o}),s.push({kind:"erase",target:e,config:l}),s.push({kind:"pause",duration:a})}),this.sequence(s,{repeat:i})}
/**
     * Staggers typing across multiple DOM elements with an offset delay between each item.
     *
     * @param {Element[] | NodeList | string} targets
     *   A CSS selector string matching multiple elements, or an array / NodeList of elements.
     * @param {string | string[] | ((el: Element, index: number) => string)} [textOrTexts]
     *   A string, an array of strings (one per target), or a resolver callback.
     *   If omitted, reads each element's existing textContent.
     * @param {Partial<TypeFlowConfig> & { stagger?: number }} [config={}]
     *   TypeFlow options merged with `stagger` offset delay in ms (default: `150`).
     * @returns {TypeFlowController}
     *
     * @example
     * TypeFlow.stagger('.prompt-line', [
     *   'npm install @staticcanvas/typeflow',
     *   'npm run build',
     *   'typeflow start --port=3000',
     *   'Ready on http://localhost:3000'
     * ], {
     *   speed: 30,
     *   stagger: 250,
     *   cursor: '|'
     * });
     */stagger(e,t,n={}){var r;let l=[];if("string"==typeof e)l="undefined"!=typeof document?Array.from(document.querySelectorAll(e)):[];else if(Array.isArray(e))l=e.map(e=>{try{return _(e)}catch(e){return null}}).filter(Boolean);else if(e&&"function"==typeof e[Symbol.iterator])l=Array.from(e).map(e=>{try{return _(e)}catch(e){return null}}).filter(Boolean);else try{const t=_(e);t&&(l=[t])}catch(e){}if(0===l.length)return{stop:()=>{},promise:Promise.resolve({completed:!0,text:""})};const o=null!=(r=n.stagger)?r:150,a=[];let i=!1;const s=l.map((e,r)=>{var l;let i="";i="function"==typeof t?t(e,r):Array.isArray(t)?void 0!==t[r]?t[r]:"":"string"==typeof t?t:e.textContent||"";const s=(null!=(l=n.delay)?l:0)+r*o,d=u(c({},n),{delay:s}),p=this.type(e,i,d);return a.push(p),p.promise});return{stop:()=>{i=!0,a.forEach(e=>e.stop())},promise:Promise.all(s).then(e=>{const t=e.every(e=>e.completed);return{completed:!i&&t,text:e.map(e=>e.text).join("\n")}})}}
/**
     * Observes a DOM subtree for mutations and invokes `callback` whenever
     * elements matching `childSelector` are added to the tree. Also invokes the
     * callback immediately for any pre-existing matching elements inside
     * `container`.
     *
     * Useful for animating dynamically injected content (e.g. chat messages,
     * feed items, server-streamed responses) without polling.
     *
     * @param {Element | string} container
     *   The root element whose subtree is observed.
     * @param {string} childSelector
     *   A CSS selector string. Newly added elements matching this selector
     *   will trigger `callback`.
     * @param {(el: Element) => void} callback
     *   Function invoked with each matching element. Runs synchronously for
     *   pre-existing matches and on the microtask after each mutation.
     * @returns {{ disconnect: () => void }}
     *   An object with a `disconnect()` method that stops observation.
     *
     * @example
     * const watcher = TypeFlow.watch('#feed', '.item-title', (el) => {
     *   const text = el.textContent;
     *   el.textContent = '';
     *   TypeFlow.type(el, text, { speed: 20 });
     * });
     *
     * // Stop observing when the container is destroyed
     * watcher.disconnect();
     */watch(e,t,n){const r=_(e);r.querySelectorAll(t).forEach(n);const l=new MutationObserver(e=>{for(const r of e)r.addedNodes.forEach(e=>{if(e.nodeType!==Node.ELEMENT_NODE)return;const r=e;r.matches(t)&&n(r),r.querySelectorAll(t).forEach(n)})});return l.observe(r,{childList:!0,subtree:!0}),{disconnect:()=>l.disconnect()}}
/**
     * Layout stabilization helper that measures a list of rotating candidate
     * phrases and locks the target container's inline dimensions to prevent
     * Cumulative Layout Shift (CLS).
     *
     * @param {Element | string} target
     *   A DOM element or a CSS selector string.
     * @param {string[]} candidates
     *   An array of strings/phrases that will rotate inside this container.
     * @returns {void}
     *
     * @example
     * TypeFlow.fit('#slogan', ['short', 'very long phrase that wraps']);
     */fit(e,t=[]){const n=_(e);if(!Array.isArray(t)||!t.length||"undefined"==typeof document)return;const r=document.createElement("span");r.style.cssText="position:absolute;visibility:hidden;opacity:0;pointer-events:none;white-space:nowrap;";const l="undefined"!=typeof window&&window.getComputedStyle?window.getComputedStyle(n):null;l&&(r.style.font=l.font,r.style.fontSize=l.fontSize,r.style.fontWeight=l.fontWeight,r.style.letterSpacing=l.letterSpacing,r.style.textTransform=l.textTransform),document.body.appendChild(r);let o=0;t.forEach(e=>{r.textContent=String(e).replace(/<[^>]*>/g,""),o=Math.max(o,r.getBoundingClientRect().width)}),r.remove(),o>0&&(n.style.display="inline-block",n.style.minWidth=`${Math.ceil(o)}px`)}
/**
     * Stops any animation currently running on `target`. If no animation is
     * active on the element this method is a no-op.
     *
     * Equivalent to calling `controller.stop()` on the controller returned by
     * the originating `type()`, `erase()`, `sequence()`, or `rotate()` call.
     *
     * @param {Element | string} target - Target element or CSS selector string.
     * @returns {void}
     *
     * @example
     * TypeFlow.type('#el', 'Long text...');
     * // Stop from another handler without keeping a reference to the controller
     * TypeFlow.stop('#el');
     */stop(e){var t;const n=_(e);n&&(this.clearCursorInterval(n),null==(t=this.active.get(n))||t.stop())}
/**
     * Stops all animations currently managed by this engine instance.
     *
     * @returns {void}
     *
     * @example
     * // Clean up all running animations on page unload
     * window.addEventListener('pagehide', () => TypeFlow.stopAll());
     */stopAll(){this.cursorIntervals.forEach(e=>clearInterval(e)),this.cursorIntervals.clear(),Array.from(this.active.values()).forEach(e=>e.stop())}
/**
     * Returns `true` when `target` has an active animation managed by this
     * engine instance.
     *
     * @param {Element | string} target - Target element or CSS selector string.
     * @returns {boolean}
     *
     * @example
     * if (!TypeFlow.isTyping('#el')) {
     *   TypeFlow.type('#el', 'Now available.');
     * }
     */isTyping(e){const t=q(e);return!!t&&this.active.has(t)}},$={
/**
     * Creates a `type` step that types `text` into `target`.
     * @param {Element | string} target
     * @param {string} [text='']
     * @param {Partial<TypeFlowConfig>} [config]
     * @returns {SequenceStep}
     */
type:(e,t="",n)=>({kind:"type",target:e,text:t,config:n}),
/**
     * Creates an `erase` step that erases content from `target`.
     * @param {Element | string} target
     * @param {Partial<TypeFlowConfig>} [config]
     * @returns {SequenceStep}
     */
erase:(e,t)=>({kind:"erase",target:e,config:t}),
/**
     * Creates a `pause` step that waits `duration` milliseconds.
     * @param {number} duration - Wait time in milliseconds.
     * @returns {SequenceStep}
     */
pause:e=>({kind:"pause",duration:e}),
/**
     * Creates a `visible` step that waits until `target` enters the viewport.
     * @param {Element | string} target
     * @param {number} [threshold=0.1] - Intersection threshold (0–1).
     * @returns {SequenceStep}
     */
visible:(e,t)=>({kind:"visible",target:e,threshold:t}),
/**
     * Creates a `call` step that invokes `fn`. May be async.
     * @param {() => void | Promise<void>} fn
     * @returns {SequenceStep}
     */
call:e=>({kind:"call",fn:e})};"undefined"!=typeof window&&(window.TypeFlow=W,window.TypeFlowSeq=$),e.TypeFlow=W,e.createTypeFlowAlpine=function(e){if(!e||"function"!=typeof e.directive)throw new Error("[TypeFlow] createTypeFlowAlpine requires an Alpine instance with directive() support.");e.directive("typeflow",(e,{expression:t},{evaluateLater:n,effect:r,cleanup:l})=>{const o=n(t);let a=null;r(()=>{o(t=>{var n,r;if(null==a||a.stop(),null==t)return;const l="object"==typeof t&&null!==t?null!=(n=t.text)?n:"":String(t),o="object"==typeof t&&null!==t&&null!=(r=t.config)?r:{};a=W.type(e,l,o)})}),"function"==typeof l&&l(()=>null==a?void 0:a.stop())})},e.createTypeFlowReact=function(e){return function(t,n={}){const r=e.useRef(null);return e.useEffect(()=>{if(!r.current)return;const e=W.type(r.current,t,n);return()=>e.stop()},[t]),r}},e.createTypeFlowSequenceReact=function(e){return function(t,n){e.useEffect(()=>{const e=W.sequence(t());return()=>e.stop()},n)}},e.createTypeFlowSequenceVue=function(e){return function(t){let n=null;return e.onBeforeUnmount(()=>null==n?void 0:n.stop()),()=>{null==n||n.stop(),n=W.sequence(t())}}},e.createTypeFlowSolid=function(e){return function(t,n={}){let r,l=null;return e.createEffect(()=>{const e="function"==typeof t?t():t;r&&(null==l||l.stop(),l=W.type(r,e,n))}),e.onCleanup(()=>{null==l||l.stop()}),e=>{r=e}}},e.createTypeFlowSvelte=function(){return function(e,t){let n=null;const r=t=>{null==n||n.stop();const r="string"==typeof t?t:t.text,l="object"==typeof t?t.config:{};n=W.type(e,r,l)};return r(t),{update(e){r(e)},destroy(){null==n||n.stop()}}}},e.createTypeFlowVue=function(e){return function(t,n={}){const r=e.ref(null);let l=null;return e.watch(t,()=>{r.value&&(l=W.type(r.value,t(),n))},{immediate:!0}),e.onBeforeUnmount(()=>null==l?void 0:l.stop()),r}},e.default=W,e.defineTypeFlowElement=function(e=("undefined"!=typeof customElements?customElements:null)){var t,n,r;if(e&&!e.get("type-flow")){class l extends HTMLElement{constructor(){super(...arguments),m(this,n),m(this,t,null)}static get observedAttributes(){return["text","speed","direction","cursor","type-style","erase-style","scramble-charset","audio"]}connectedCallback(){h(this,n,r).call(this)}disconnectedCallback(){var e;null==(e=f(this,t))||e.stop()}attributeChangedCallback(e,t,l){this.isConnected&&t!==l&&h(this,n,r).call(this)}stop(){var e;null==(e=f(this,t))||e.stop()}}t=new WeakMap,n=new WeakSet,r=function(){var e,n,r,l;null==(e=f(this,t))||e.stop();const o=null!=(r=null!=(n=this.getAttribute("text"))?n:this.textContent)?r:"",a=this.hasAttribute("speed")?Number(this.getAttribute("speed")):40,i=this.getAttribute("direction")||"left",s=null!=(l=this.getAttribute("cursor"))?l:"|",c=this.getAttribute("type-style")||"char",u=this.getAttribute("erase-style")||"end",d=this.getAttribute("scramble-charset")||"matrix",m=this.getAttribute("audio")||void 0;var h,y,g,b;h=this,y=t,g=W.type(this,o,{speed:a,direction:i,cursor:s,typeStyle:c,eraseStyle:u,scrambleCharset:d,audio:m}),p(h,y,"write to private field"),b?b.call(h,g):y.set(h,g)},e.define("type-flow",l)}},e.seq=$,Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
//# sourceMappingURL=typeflow.js.map
