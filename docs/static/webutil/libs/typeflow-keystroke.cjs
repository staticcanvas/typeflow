/*! typeflow-keystroke | MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TypeflowKeystroke={})}(this,function(e){"use strict";const t={"`":[0,0],1:[0,1],2:[0,2],3:[0,3],4:[0,4],5:[0,5],6:[0,6],7:[0,7],8:[0,8],9:[0,9],0:[0,10],"-":[0,11],"=":[0,12],q:[1,1.5],w:[1,2.5],e:[1,3.5],r:[1,4.5],t:[1,5.5],y:[1,6.5],u:[1,7.5],i:[1,8.5],o:[1,9.5],p:[1,10.5],"[":[1,11.5],"]":[1,12.5],a:[2,1.8],s:[2,2.8],d:[2,3.8],f:[2,4.8],g:[2,5.8],h:[2,6.8],j:[2,7.8],k:[2,8.8],l:[2,9.8],";":[2,10.8],"'":[2,11.8],z:[3,2.2],x:[3,3.2],c:[3,4.2],v:[3,5.2],b:[3,6.2],n:[3,7.2],m:[3,8.2],",":[3,9.2],".":[3,10.2],"/":[3,11.2]," ":[4,6]},o={a:["s","q","z","w"],b:["v","g","h","n"],c:["x","d","f","v"],d:["s","e","r","f","c","x"],e:["w","s","d","r"],f:["d","r","t","g","v","c"],g:["f","t","y","h","b","v"],h:["g","y","u","j","n","b"],i:["u","j","k","o"],j:["h","u","i","k","m","n"],k:["j","i","o","l","m"],l:["k","o","p",";"],m:["n","j","k"],n:["b","h","j","m"],o:["i","k","l","p"],p:["o","l","["],q:["1","2","w","a"],r:["e","d","f","t"],s:["a","w","e","d","x","z"],t:["r","f","g","y"],u:["y","h","j","i"],v:["c","f","g","b"],w:["q","a","s","e"],x:["z","s","d","c"],y:["t","g","h","u"],z:["a","s","x"]};function n(e,o){const n=t[String(e).toLowerCase()]||[2,5],s=t[String(o).toLowerCase()]||[2,5],a=s[0]-n[0],r=s[1]-n[1];return Math.sqrt(r*r+a*a)}class s{
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Computes dynamic typing delay between two consecutive characters based on physical distance, fatigue, and punctuation.
     * @param {string} prevChar - Previously typed character.
     * @param {string} nextChar - Character about to be typed.
     * @param {Object} [options={}] - Cadence calculation options.
     * @returns {number} Calculated delay in milliseconds.
     *
     * -------------
     *
     * @Properties
     * @param {string} prevChar - The last typed character.
     * @param {string} nextChar - The next character to type.
     * @param {number} [options.baseSpeed=45] - Base typing speed in milliseconds per unit.
     * @param {number} [options.fatigueIndex=0] - Character index counter in active passage.
     * @param {number} [options.fatigueRate=0.0001] - Gradual deceleration coefficient per character.
     *
     * -------------
     *
     * @example
     * const delay = TypeFlowKeystroke.getDelay('a', 'b', { baseSpeed: 40 });
     * const pauseAfterPeriod = TypeFlowKeystroke.getDelay('.', 'T', { baseSpeed: 40 });
     */
static getDelay(e,t,o={}){const s=o.baseSpeed||45,a=1+(o.fatigueIndex||0)*(o.fatigueRate||1e-4),r=n(e,t),i=1+Math.min(.6,.06*r);let p=0;"."===e||"!"===e||"?"===e?p=240:","===e||";"===e||":"===e?p=120:" "!==e&&"\n"!==e||(p=35);const u=.85+.3*Math.random();return Math.round((s*i*a+p)*u)}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Transforms plain text into a sequence of typing, hesitation pauses, adjacent-key typos, and backspace corrections.
     * @param {string} text - Source text string to humanize.
     * @param {Object} [options={}] - Typo and cadence simulation settings.
     * @returns {Array<Object>} List of step actions ({ type: 'type' | 'erase' | 'pause', char?, duration?, isTypo? }).
     *
     * -------------
     *
     * @Properties
     * @param {string} text - The input text.
     * @param {number} [options.errorRate=0.04] - Probability of introducing an adjacent-key typo (0.04 = 4%).
     * @param {number} [options.hesitationMs=180] - Pause duration in ms when a typo is made before backspacing.
     *
     * -------------
     *
     * @example
     * const actions = TypeFlowKeystroke.humanize('Fast, resilient, zero dependencies.', {
     *   errorRate: 0.05,
     *   hesitationMs: 200,
     * });
     */static humanize(e,t={}){var n;const s=null!=(n=t.errorRate)?n:.04,a=[];for(let n=0;n<e.length;n++){const r=e[n],i=r.toLowerCase(),p=o[i];if(p&&p.length>0&&Math.random()<s&&" "!==r&&"\n"!==r){const e=p[Math.floor(Math.random()*p.length)],o=r!==i?e.toUpperCase():e;a.push({type:"type",char:o,isTypo:!0}),a.push({type:"pause",duration:t.hesitationMs||180}),a.push({type:"erase",count:1}),a.push({type:"type",char:r,isTypo:!1})}else a.push({type:"type",char:r,isTypo:!1})}return a}}"undefined"!=typeof window&&(window.TypeFlowKeystroke=s),e.TypeFlowKeystroke=s,e.calculateKeyDistance=n,Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=typeflow-keystroke.cjs.map
