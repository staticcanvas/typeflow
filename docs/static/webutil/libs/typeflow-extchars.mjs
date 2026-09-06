/*! typeflow-extchars | MIT */
var t=Object.defineProperty,r=Object.getOwnPropertySymbols,e=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable,o=(r,e,a)=>e in r?t(r,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):r[e]=a;const s={
// Ancient & Sacred Scripts
hieroglyphs:"𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀔𓀕𓀖𓀗𓀘𓀙𓀚𓀛𓀜𓀝𓀞𓀟𓀠𓀡𓀢𓀣𓀤𓀥𓀦𓀧𓀨𓀩𓀪𓀫𓀬𓀭𓀮𓀯𓀰𓀱𓀲𓀳𓀴𓀵𓀶𓀷𓀸𓀹𓀺𓀻",runic:"ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ",ogham:"ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊᚋᚌᚍᚎᚏᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚ",coptic:"ⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨPhiⲬⲮⲰϢϤϦϨϪϬϮ",
// Cyber & Terminal
katakana:"ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ",cyberMatrix:"01010101_#@!<>[]{}/*+=~-ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01",blocks:"█▓▒░▀▄▌▐■□▢▣▤▥▦▧▨▩",boxDrawing:"─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═║╔╗╚╝╠╣╦╩╬",
// Mathematical & Technical
mathSymbols:"∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳∴∵∶∷∸∹∺∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯",braille:"⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿",astronomical:"☉☽☿♀♁♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓☄★☆⚡",geometric:"▲▼◀▶▲▼◀▶◆◇◈◉◊○●◎◐◑◒◓◔◕◖◗◘◙◜◝◞◟◠◡◢◣◤◥",
// Glitch
glitch:"!<>-_\\/[]{}—=+*^?#________̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠"},n=class t{
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
static getCharset(r){return t.charsets[String(r).toLowerCase()]||s.cyberMatrix}
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
   */static registerCharset(r,e){"string"==typeof r&&"string"==typeof e&&(t.charsets[r.toLowerCase()]=e)}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Combines multiple charsets into a single merged pool.
   * @param {...string} names - Charset names to concatenate.
   * @returns {string} Merged character string.
   *
   * -------------
   *
   * @example
   * const cyberRunes = TypeFlowExtChars.combineCharsets('cyberMatrix', 'runic', 'katakana');
   */static combineCharsets(...r){return r.map(r=>t.getCharset(r)).join("")}
/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Selects a random single glyph from a charset string or preset name.
   * @param {string} charsetOrName - Charset string or registered name.
   * @returns {string} Random single character glyph.
   *
   * -------------
   *
   * @example
   * const rune = TypeFlowExtChars.randomGlyph('runic');
   */static randomGlyph(r){const e=t.charsets[r]||r||s.cyberMatrix,a=Array.from(e);return a[Math.floor(Math.random()*a.length)]||"#"}};var i,c,l;i=n,c="charsets",l=((t,s)=>{for(var n in s||(s={}))e.call(s,n)&&o(t,n,s[n]);if(r)for(var n of r(s))a.call(s,n)&&o(t,n,s[n]);return t})({},s),o(i,"symbol"!=typeof c?c+"":c,l);let h=n;function y(t){return h.getCharset(t)}"undefined"!=typeof window&&(window.TypeFlowExtChars=h,window.EXT_CHARSETS=s,window.getExtendedCharset=y);export{s as EXT_CHARSETS,h as TypeFlowExtChars,y as getExtendedCharset};
//# sourceMappingURL=typeflow-extchars.mjs.map
