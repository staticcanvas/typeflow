/**
 * TypeFlow ExtChars - Extended Unicode Glyph Presets & Scramble Pools.
 */
export const EXT_CHARSETS: {
  hieroglyphs: string;
  runic: string;
  ogham: string;
  coptic: string;
  katakana: string;
  cyberMatrix: string;
  blocks: string;
  boxDrawing: string;
  mathSymbols: string;
  braille: string;
  astronomical: string;
  geometric: string;
  glitch: string;
};

export class TypeFlowExtChars {
  static charsets: Record<string, string>;
  static getCharset(name: string): string;
  static registerCharset(name: string, glyphs: string): void;
  static combineCharsets(...names: string[]): string;
  static randomGlyph(charsetOrName: string): string;
}

export function getExtendedCharset(name: string): string;
