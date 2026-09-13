export type Palette = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  gold: string;
  goldMuted: string;
  highlightRed: string;
  border: string;
  danger: string;
  overlay: string;
};

// A manuscript-illumination palette: deep teal-emerald (Islamic architecture,
// mosque domes) as the brand color, antique brass gold for gilding accents,
// and a warm parchment ground rather than a flat neutral cream.
export const lightPalette: Palette = {
  background: '#FAF6ED',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#211D16',
  textMuted: '#6B6255',
  primary: '#0E5D52',
  primaryText: '#FFFFFF',
  gold: '#B08A3E',
  goldMuted: 'rgba(176, 138, 62, 0.14)',
  highlightRed: '#8A2E3B',
  border: 'rgba(176, 138, 62, 0.28)',
  danger: '#B3261E',
  overlay: 'rgba(15, 20, 18, 0.55)',
};

export const darkPalette: Palette = {
  background: '#121917',
  surface: '#1B2422',
  card: '#202B28',
  text: '#F0ECE1',
  textMuted: '#A9A296',
  primary: '#3FA98F',
  primaryText: '#052420',
  gold: '#D9B36C',
  goldMuted: 'rgba(217, 179, 108, 0.16)',
  highlightRed: '#D98A93',
  border: 'rgba(217, 179, 108, 0.30)',
  danger: '#F2B8B5',
  overlay: 'rgba(0, 0, 0, 0.65)',
};
