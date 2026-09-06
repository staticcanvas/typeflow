/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow ExtChars - Extended Unicode Glyph Presets & Scramble Pools.
 * Provides specialized ancient alphabets, mathematical operators, Katakana,
 * box-drawing frames, astrological runes, and cyber glitch character sets.
 *
 * @module @staticcanvas/typeflow/extchars
 */

export const EXT_CHARSETS = {
  // Ancient & Sacred Scripts
  hieroglyphs: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀔𓀕𓀖𓀗𓀘𓀙𓀚𓀛𓀜𓀝𓀞𓀟𓀠𓀡𓀢𓀣𓀤𓀥𓀦𓀧𓀨𓀩𓀪𓀫𓀬𓀭𓀮𓀯𓀰𓀱𓀲𓀳𓀴𓀵𓀶𓀷𓀸𓀹𓀺𓀻',
  runic: 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ',
  ogham: 'ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊᚋᚌᚍᚎᚏᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚ',
  coptic: 'ⲀⲂⲄⲆⲈⲊⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨPhiⲬⲮⲰϢϤϦϨϪϬϮ',

  // Cyber & Terminal
  katakana: 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
  cyberMatrix: '01010101_#@!<>[]{}/*+=~-ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01',
  blocks: '█▓▒░▀▄▌▐■□▢▣▤▥▦▧▨▩',
  boxDrawing:
    '─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═║╔╗╚╝╠╣╦╩╬',

  // Mathematical & Technical
  mathSymbols:
    '∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳∴∵∶∷∸∹∺∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯',
  braille: '⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿',
  astronomical: '☉☽☿♀♁♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓☄★☆⚡',
  geometric: '▲▼◀▶▲▼◀▶◆◇◈◉◊○●◎◐◑◒◓◔◕◖◗◘◙◜◝◞◟◠◡◢◣◤◥',

  // Glitch
  glitch: '!<>-_\\/[]{}—=+*^?#________̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠',
};

export class TypeFlowExtChars {
  static charsets = { ...EXT_CHARSETS };

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
  static getCharset(name) {
    return TypeFlowExtChars.charsets[String(name).toLowerCase()] || EXT_CHARSETS.cyberMatrix;
  }

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
   */
  static registerCharset(name, glyphs) {
    if (typeof name === 'string' && typeof glyphs === 'string') {
      TypeFlowExtChars.charsets[name.toLowerCase()] = glyphs;
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Combines multiple charsets into a single merged pool.
   * @param {...string} names - Charset names to concatenate.
   * @returns {string} Merged character string.
   *
   * -------------
   *
   * @example
   * const cyberRunes = TypeFlowExtChars.combineCharsets('cyberMatrix', 'runic', 'katakana');
   */
  static combineCharsets(...names) {
    return names.map((n) => TypeFlowExtChars.getCharset(n)).join('');
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Selects a random single glyph from a charset string or preset name.
   * @param {string} charsetOrName - Charset string or registered name.
   * @returns {string} Random single character glyph.
   *
   * -------------
   *
   * @example
   * const rune = TypeFlowExtChars.randomGlyph('runic');
   */
  static randomGlyph(charsetOrName) {
    const pool =
      TypeFlowExtChars.charsets[charsetOrName] || charsetOrName || EXT_CHARSETS.cyberMatrix;
    const chars = Array.from(pool);
    return chars[Math.floor(Math.random() * chars.length)] || '#';
  }
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description Helper function returning an extended charset string by name.
 * @param {string} name - Charset identifier.
 * @returns {string}
 *
 * -------------
 *
 * @example
 * import { getExtendedCharset } from '@staticcanvas/typeflow/extchars';
 * const hieroglyphs = getExtendedCharset('hieroglyphs');
 */
export function getExtendedCharset(name) {
  return TypeFlowExtChars.getCharset(name);
}

if (typeof window !== 'undefined') {
  window.TypeFlowExtChars = TypeFlowExtChars;
  window.EXT_CHARSETS = EXT_CHARSETS;
  window.getExtendedCharset = getExtendedCharset;
}
