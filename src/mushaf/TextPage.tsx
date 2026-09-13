import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Share, StyleSheet, Text, View } from 'react-native';

import { AyahLine } from '../components/AyahLine';
import { isBookmarked as checkIsBookmarked, toggleBookmark } from '../db/bookmarksRepository';
import { getAyahsByPage, getAyahsBySurah, getSurahs } from '../db/quranRepository';
import type { Ayah, Surah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import { useAudioStore } from '../state/audioStore';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AyahActionSheet } from './AyahActionSheet';

type Props = {
  pageNumber: number;
  palette: Palette;
};

export function TextPage({ pageNumber, palette }: Props): React.JSX.Element {
  const db = useQuranDb();
  const playAyah = useAudioStore((s) => s.playAyah);
  const playQueue = useAudioStore((s) => s.playQueue);
  const [loaded, setLoaded] = useState<{ page: number; ayahs: Ayah[] } | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());

  const loading = loaded?.page !== pageNumber;
  const ayahs = useMemo(
    () => (loaded?.page === pageNumber ? loaded.ayahs : []),
    [loaded, pageNumber]
  );

  useEffect(() => {
    let cancelled = false;
    getAyahsByPage(db, pageNumber).then((list) => {
      if (!cancelled) setLoaded({ page: pageNumber, ayahs: list });
    });
    return () => {
      cancelled = true;
    };
  }, [db, pageNumber]);

  useEffect(() => {
    getSurahs(db).then(setSurahs);
  }, [db]);

  const bookmarkKey = (surahId: number, ayahNumber: number): string => `${surahId}:${ayahNumber}`;

  const refreshBookmarkFlags = useCallback(
    (list: Ayah[]) => {
      Promise.all(
        list.map(async (a) => {
          const bookmarked = await checkIsBookmarked(db, a.surahId, a.ayahNumber);
          return [bookmarkKey(a.surahId, a.ayahNumber), bookmarked] as const;
        })
      ).then((entries) => {
        setBookmarkedKeys(new Set(entries.filter(([, v]) => v).map(([k]) => k)));
      });
    },
    [db]
  );

  useEffect(() => {
    if (ayahs.length > 0) refreshBookmarkFlags(ayahs);
  }, [ayahs, refreshBookmarkFlags]);

  const surahName = selectedAyah ? surahs.find((s) => s.id === selectedAyah.surahId)?.nameAr ?? null : null;

  const openActionSheet = async (ayah: Ayah): Promise<void> => {
    setSelectedAyah(ayah);
    setIsBookmarked(bookmarkedKeys.has(bookmarkKey(ayah.surahId, ayah.ayahNumber)));
  };

  const closeActionSheet = (): void => setSelectedAyah(null);

  const handleToggleBookmark = async (): Promise<void> => {
    if (!selectedAyah) return;
    const nowBookmarked = await toggleBookmark(db, selectedAyah.surahId, selectedAyah.ayahNumber);
    setIsBookmarked(nowBookmarked);
    setBookmarkedKeys((prev) => {
      const next = new Set(prev);
      const key = bookmarkKey(selectedAyah.surahId, selectedAyah.ayahNumber);
      if (nowBookmarked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handlePlayAyah = (): void => {
    if (!selectedAyah) return;
    playAyah(selectedAyah.surahId, selectedAyah.ayahNumber);
    closeActionSheet();
  };

  const handlePlaySurahFromHere = async (): Promise<void> => {
    if (!selectedAyah) return;
    const surahAyahs = await getAyahsBySurah(db, selectedAyah.surahId);
    const fromHere = surahAyahs.filter((a) => a.ayahNumber >= selectedAyah.ayahNumber);
    playQueue(fromHere.map((a) => ({ surahId: a.surahId, ayahNumber: a.ayahNumber })));
    closeActionSheet();
  };

  const handleCopy = async (): Promise<void> => {
    if (!selectedAyah) return;
    await Clipboard.setStringAsync(selectedAyah.textAr);
    closeActionSheet();
  };

  const handleShare = async (): Promise<void> => {
    if (!selectedAyah) return;
    try {
      await Share.share({ message: selectedAyah.textAr });
    } catch {
      // Ignore: user cancelled the native share sheet.
    }
    closeActionSheet();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.gold} />
      </View>
    );
  }

  if (ayahs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: palette.textMuted, fontFamily: fonts.regular }}>لا توجد آيات في هذه الصفحة</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={ayahs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AyahLine
            ayahNumber={item.ayahNumber}
            text={item.textAr}
            palette={palette}
            highlighted={bookmarkedKeys.has(bookmarkKey(item.surahId, item.ayahNumber))}
            onLongPress={() => openActionSheet(item)}
          />
        )}
      />
      <AyahActionSheet
        ayah={selectedAyah}
        surahName={surahName}
        isBookmarked={isBookmarked}
        palette={palette}
        onClose={closeActionSheet}
        onToggleBookmark={handleToggleBookmark}
        onCopy={handleCopy}
        onShare={handleShare}
        onPlayAyah={handlePlayAyah}
        onPlaySurahFromHere={handlePlaySurahFromHere}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
});
