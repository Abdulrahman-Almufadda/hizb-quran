import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as audioManager from '../audio/audioManager';
import { DEFAULT_RECITER_ID } from '../audio/reciters';

type AudioState = {
  reciterId: string;
  queue: audioManager.QueueItem[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  setReciter: (id: string) => void;
  playAyah: (surahId: number, ayahNumber: number) => Promise<void>;
  playQueue: (items: audioManager.QueueItem[], startIndex?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => {
      audioManager.subscribeAudioManager((managerState) => {
        set(managerState);
      });
      audioManager.setReciter(get().reciterId ?? DEFAULT_RECITER_ID);

      return {
        reciterId: DEFAULT_RECITER_ID,
        queue: [],
        queueIndex: -1,
        isPlaying: false,
        isBuffering: false,
        error: null,
        setReciter: (id) => {
          audioManager.setReciter(id);
          set({ reciterId: id });
        },
        playAyah: (surahId, ayahNumber) => audioManager.playQueue([{ surahId, ayahNumber }]),
        playQueue: (items, startIndex) => audioManager.playQueue(items, startIndex),
        pause: () => audioManager.pause(),
        resume: () => audioManager.resume(),
        stop: () => audioManager.stop(),
        next: () => audioManager.advanceQueue(),
        previous: () => audioManager.goToPrevious(),
      };
    },
    {
      name: 'hizb.audio',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ reciterId: state.reciterId }),
      onRehydrateStorage: () => (state) => {
        if (state?.reciterId) audioManager.setReciter(state.reciterId);
      },
    }
  )
);

export function currentQueueItem(state: Pick<AudioState, 'queue' | 'queueIndex'>): audioManager.QueueItem | null {
  return state.queue[state.queueIndex] ?? null;
}
