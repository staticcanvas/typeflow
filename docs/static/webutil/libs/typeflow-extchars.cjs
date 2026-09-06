/*! typeflow-extchars | MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).TypeflowExtChars={})}(this,function(e){"use strict";var t=Object.defineProperty,r=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable,n=(e,r,o)=>r in e?t(e,r,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[r]=o;const s={
// Ancient & Sacred Scripts
hieroglyphs:"𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀔𓀕𓀖𓀗𓀘𓀙𓀚𓀛𓀜𓀝𓀞𓀟𓀠𓀡𓀢𓀣𓀤𓀥𓀦𓀧𓀨𓀩𓀪𓀫𓀬𓀭𓀮𓀯𓀰𓀱𓀲𓀳𓀴𓀵𓀶𓀷𓀸𓀹𓀺𓀻",runic:"ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ",ogham:"ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊᚋᚌᚍᚎᚏᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚ",coptic:"ⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨPhiⲬⲮⲰϢϤϦϨϪϬϮ",
// Cyber & Terminal
katakana:"ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ",cyberMatrix:"01010101_#@!<>[]{}/*+=~-ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01",blocks:"█▓▒░▀▄▌▐■□▢▣▤▥▦▧▨▩",boxDrawing:"─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═║╔╗╚╝╠╣╦╩╬",
// Mathematical & Technical
mathSymbols:"∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳∴∵∶∷∸∹∺∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯",braille:"⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿",astronomical:"☉☽☿♀♁♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓☄★☆⚡",geometric:"▲▼◀▶▲▼◀▶◆◇◈◉◊○●◎◐◑◒◓◔◕◖◗◘◙◜◝◞◟◠◡◢◣◤◥",
// Glitch
glitch:"!<>-_\\/[]{}—=+*^?#________̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠"},i=class e{
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Retrieves a character set string by preset name.
     * @param {string} name - The charset identifier ('hieroglyphs', 'runic', 'ogham', 'coptic', 'katakana', 'boxDrawing', 'mathSymbols', 'braille', 'astronomical', 'geometric', 'glitch').
     * @returns {string} String of glyph characters.
     *
     * -------------
     *
     * @Properties
     * @param {string} name - Name of the charset.
     *
     * -------------
     *
     * @example
     * const runes = TypeFlowExtChars.getCharset('runic');
     * console.log('Runic runes:', runes);
     */
static getCharset(t){return e.charsets[String(t).toLowerCase()]||s.cyberMatrix}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Registers a new custom charset preset globally.
     * @param {string} name - Unique identifier for the custom charset.
     * @param {string} glyphs - Pool of characters to associate with this preset.
     * @returns {void}
     *
     * -------------
     *
     * @Properties
     * @param {string} name - Identifier name.
     * @param {string} glyphs - String of characters.
     *
     * -------------
     *
     * @example
     * TypeFlowExtChars.registerCharset('alchemy', '🜁🜂🜃🜄🜅🜆🜇🜈🜉🜊');
     * const alchemy = TypeFlowExtChars.getCharset('alchemy');
     */static registerCharset(t,r){"string"==typeof t&&"string"==typeof r&&(e.charsets[t.toLowerCase()]=r)}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Combines multiple charsets into a single merged pool.
     * @param {...string} names - Charset names to concatenate.
     * @returns {string} Merged character string.
     *
     * -------------
     *
     * @example
     * const cyberRunes = TypeFlowExtChars.combineCharsets('cyberMatrix', 'runic', 'katakana');
     */static combineCharsets(...t){return t.map(t=>e.getCharset(t)).join("")}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
     * @description Selects a random single glyph from a charset string or preset name.
     * @param {string} charsetOrName - Charset string or registered name.
     * @returns {string} Random single character glyph.
     *
     * -------------
     *
     * @example
     * const rune = TypeFlowExtChars.randomGlyph('runic');
     */static randomGlyph(t){const r=e.charsets[t]||t||s.cyberMatrix,o=Array.from(r);return o[Math.floor(Math.random()*o.length)]||"#"}};var c,l,f;c=i,l="charsets",f=((e,t)=>{for(var s in t||(t={}))o.call(t,s)&&n(e,s,t[s]);if(r)for(var s of r(t))a.call(t,s)&&n(e,s,t[s]);return e})({},s),n(c,"symbol"!=typeof l?l+"":l,f);let h=i;function p(e){return h.getCharset(e)}"undefined"!=typeof window&&(window.TypeFlowExtChars=h,window.EXT_CHARSETS=s,window.getExtendedCharset=p),e.EXT_CHARSETS=s,e.TypeFlowExtChars=h,e.getExtendedCharset=p,Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=typeflow-extchars.cjs.map
