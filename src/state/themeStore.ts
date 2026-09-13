import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { darkPalette, lightPalette, type Palette } from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'hizb.theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useAppPalette(): { palette: Palette; isDark: boolean; mode: ThemeMode } {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  return { palette: isDark ? darkPalette : lightPalette, isDark, mode };
}
