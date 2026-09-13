import {
  Amiri_400Regular,
  Amiri_400Regular_Italic,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';

export const fontAssets = {
  Amiri_400Regular,
  Amiri_400Regular_Italic,
  Amiri_700Bold,
  AmiriQuran_400Regular,
};

export const fonts = {
  regular: 'Amiri_400Regular',
  italic: 'Amiri_400Regular_Italic',
  bold: 'Amiri_700Bold',
  quran: 'AmiriQuran_400Regular',
} as const;

export const typeScale = {
  ayahBody: 22,
  ayahBodyLarge: 26,
  surahTitle: 22,
  surahTitleLarge: 26,
  screenTitle: 20,
  body: 16,
  caption: 13,
} as const;
