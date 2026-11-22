import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Share } from 'react-native';

import { isBookmarked as checkIsBookmarked, toggleBookmark } from '../db/bookmarksRepository';
import { getReciterById } from '../audio/reciters';
import { ReciterPickerModal } from '../components/ReciterPickerModal';
import { getAyahsBySurah, getSurahs } from '../db/quranRepository';
import type { Ayah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import { useAudioStore } from '../state/audioStore';
import type { Palette } from '../theme/colors';
import { AyahActionSheet } from './AyahActionSheet';
import { TafsirModal } from './TafsirModal';

type Props = {
  ayah: Ayah | null;
  palette: Palette;
  onClose: () => void;
};

/** The ayah action sheet (play / bookmark / copy / share) with all its behaviour wired up. */
export function AyahActions({ ayah, palette, onClose }: Props): React.JSX.Element {
  const db = useQuranDb();
  const playAyah = useAudioStore((s) => s.playAyah);
  const playQueue = useAudioStore((s) => s.playQueue);
  const reciterId = useAudioStore((s) => s.reciterId);
  const setReciter = useAudioStore((s) => s.setReciter);
  const [pickingReciter, setPickingReciter] = useState(false);
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null);
  const [tafsirSurahName, setTafsirSurahName] = useState<string | null>(null);
  const [surahName, setSurahName] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!ayah) return;
    let cancelled = false;
    getSurahs(db).then((list) => {
      if (!cancelled) setSurahName(list.find((s) => s.id === ayah.surahId)?.nameAr ?? null);
    });
    checkIsBookmarked(db, ayah.surahId, ayah.ayahNumber).then((value) => {
      if (!cancelled) setIsBookmarked(value);
    });
    return () => {
      cancelled = true;
    };
  }, [db, ayah]);

  const handleToggleBookmark = async (): Promise<void> => {
    if (!ayah) return;
    setIsBookmarked(await toggleBookmark(db, ayah.surahId, ayah.ayahNumber));
  };

  const handleShowTafsir = (): void => {
    if (!ayah) return;
    setTafsirSurahName(surahName);
    setTafsirAyah(ayah);
    onClose();
  };

  const handlePlayAyah = (): void => {
    if (!ayah) return;
    void playAyah(ayah.surahId, ayah.ayahNumber);
    onClose();
  };

  const handlePlaySurahFromHere = async (): Promise<void> => {
    if (!ayah) return;
    const surahAyahs = await getAyahsBySurah(db, ayah.surahId);
    const fromHere = surahAyahs.filter((a) => a.ayahNumber >= ayah.ayahNumber);
    void playQueue(fromHere.map((a) => ({ surahId: a.surahId, ayahNumber: a.ayahNumber })));
    onClose();
  };

  const handleCopy = async (): Promise<void> => {
    if (!ayah) return;
    await Clipboard.setStringAsync(ayah.textAr);
    onClose();
  };

  const handleShare = async (): Promise<void> => {
    if (!ayah) return;
    try {
      await Share.share({ message: ayah.textAr });
    } catch {
      // Ignore: user cancelled the native share sheet.
    }
    onClose();
  };

  return (
    <>
    <AyahActionSheet
      ayah={ayah}
      surahName={surahName}
      isBookmarked={isBookmarked}
      palette={palette}
      onClose={onClose}
      onToggleBookmark={handleToggleBookmark}
      onCopy={handleCopy}
      onShare={handleShare}
      onPlayAyah={handlePlayAyah}
      onPlaySurahFromHere={handlePlaySurahFromHere}
      reciterName={getReciterById(reciterId).nameAr}
      onChangeReciter={() => setPickingReciter(true)}
      onShowTafsir={handleShowTafsir}
    />
    <TafsirModal ayah={tafsirAyah} surahName={tafsirSurahName} palette={palette} onClose={() => setTafsirAyah(null)} />
    <ReciterPickerModal
      visible={pickingReciter && ayah != null}
      selectedId={reciterId}
      palette={palette}
      onSelect={setReciter}
      onClose={() => setPickingReciter(false)}
    />
    </>
  );
}
