import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const TOTAL_MUSHAF_PAGES = 604;

export function clampPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.round(page), 1), TOTAL_MUSHAF_PAGES);
}

export type ReaderPageMode = 'mushaf' | 'text';

type ReaderState = {
  lastReadPage: number;
  pageMode: ReaderPageMode;
  setLastReadPage: (page: number) => void;
  setPageMode: (mode: ReaderPageMode) => void;
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      lastReadPage: 1,
      pageMode: 'mushaf',
      setLastReadPage: (page) => set({ lastReadPage: clampPage(page) }),
      setPageMode: (mode) => set({ pageMode: mode }),
    }),
    {
      name: 'hizb.reader',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
