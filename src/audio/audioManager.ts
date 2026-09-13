import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';

import { buildAyahAudioUrl, DEFAULT_RECITER_ID, getReciterById } from './reciters';

export type QueueItem = { surahId: number; ayahNumber: number };

export type AudioManagerState = {
  queue: QueueItem[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
};

function initialState(): AudioManagerState {
  return { queue: [], queueIndex: -1, isPlaying: false, isBuffering: false, error: null };
}

let player: AudioPlayer | null = null;
let state: AudioManagerState = initialState();
let listener: ((state: AudioManagerState) => void) | null = null;
let audioModeConfigured = false;
let currentReciterId = DEFAULT_RECITER_ID;

export function setReciter(reciterId: string): void {
  currentReciterId = reciterId;
}

function emit(partial: Partial<AudioManagerState>): void {
  state = { ...state, ...partial };
  listener?.(state);
}

export function subscribeAudioManager(callback: (state: AudioManagerState) => void): () => void {
  listener = callback;
  callback(state);
  return () => {
    if (listener === callback) listener = null;
  };
}

async function ensureAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });
  } catch (error) {
    console.warn('[audioManager] Failed to configure audio mode:', error);
  }
}

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

async function resolveLocalUri(reciterId: string, surahId: number, ayahNumber: number): Promise<string> {
  const reciter = getReciterById(reciterId);
  const remoteUrl = buildAyahAudioUrl(reciterId, surahId, ayahNumber);
  try {
    const audioDir = new Directory(Paths.cache, 'audio');
    if (!audioDir.exists) audioDir.create();
    const reciterDir = new Directory(audioDir, reciter.folder);
    if (!reciterDir.exists) reciterDir.create();

    const fileName = `${pad3(surahId)}${pad3(ayahNumber)}.mp3`;
    const file = new File(reciterDir, fileName);
    if (file.exists) return file.uri;

    const downloaded = await File.downloadFileAsync(remoteUrl, reciterDir);
    return downloaded.uri;
  } catch (error) {
    console.warn('[audioManager] Cache miss, streaming directly:', error);
    return remoteUrl;
  }
}

function getPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer();
    player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
  }
  return player;
}

function onPlaybackStatusUpdate(status: AudioStatus): void {
  if (status.error) {
    emit({ error: 'تعذر تشغيل الصوت', isPlaying: false, isBuffering: false });
    return;
  }
  emit({ isPlaying: status.playing, isBuffering: status.isBuffering });
  if (status.didJustFinish) {
    void advanceQueue();
  }
}

async function playCurrent(): Promise<void> {
  const item = state.queue[state.queueIndex];
  if (!item) return;
  emit({ isBuffering: true, error: null });
  try {
    const uri = await resolveLocalUri(currentReciterId, item.surahId, item.ayahNumber);
    const p = getPlayer();
    p.replace({ uri });
    p.play();
  } catch (error) {
    console.error('[audioManager] Failed to play ayah:', error);
    emit({ error: 'تعذر تشغيل الصوت', isBuffering: false });
  }
}

export async function playQueue(items: QueueItem[], startIndex = 0): Promise<void> {
  if (items.length === 0) return;
  await ensureAudioMode();
  emit({ queue: items, queueIndex: startIndex, error: null });
  await playCurrent();
}

export function pause(): void {
  player?.pause();
  emit({ isPlaying: false });
}

export function resume(): void {
  if (!player || state.queueIndex < 0) return;
  player.play();
}

export function stop(): void {
  player?.pause();
  emit(initialState());
}

export async function advanceQueue(): Promise<void> {
  const nextIndex = state.queueIndex + 1;
  if (nextIndex >= state.queue.length) {
    emit({ isPlaying: false });
    return;
  }
  emit({ queueIndex: nextIndex });
  await playCurrent();
}

export async function goToPrevious(): Promise<void> {
  const prevIndex = state.queueIndex - 1;
  if (prevIndex < 0) return;
  emit({ queueIndex: prevIndex });
  await playCurrent();
}

export function getAudioManagerState(): AudioManagerState {
  return state;
}
