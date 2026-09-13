import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSurahs } from '../db/quranRepository';
import type { Surah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import { currentQueueItem, useAudioStore } from '../state/audioStore';
import { useAppPalette } from '../state/themeStore';
import { fonts } from '../theme/typography';

export function MiniPlayer(): React.JSX.Element | null {
  const db = useQuranDb();
  const { palette } = useAppPalette();
  const [surahs, setSurahs] = useState<Surah[]>([]);

  const queue = useAudioStore((s) => s.queue);
  const queueIndex = useAudioStore((s) => s.queueIndex);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const isBuffering = useAudioStore((s) => s.isBuffering);
  const error = useAudioStore((s) => s.error);
  const pause = useAudioStore((s) => s.pause);
  const resume = useAudioStore((s) => s.resume);
  const stop = useAudioStore((s) => s.stop);
  const next = useAudioStore((s) => s.next);
  const previous = useAudioStore((s) => s.previous);

  useEffect(() => {
    getSurahs(db).then(setSurahs);
  }, [db]);

  const item = currentQueueItem({ queue, queueIndex });
  if (!item) return null;

  const surahName = surahs.find((s) => s.id === item.surahId)?.nameAr ?? `سورة ${item.surahId}`;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, { backgroundColor: palette.card, borderTopColor: palette.border }]}
    >
      <TouchableOpacity
        onPress={stop}
        style={styles.iconButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="إيقاف"
      >
        <Ionicons name="close" size={18} color={palette.textMuted} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, { color: error ? palette.danger : palette.text }]} numberOfLines={1}>
          {error ?? surahName}
        </Text>
        {!error ? (
          <Text style={[styles.subtitle, { color: palette.textMuted }]} numberOfLines={1}>
            الآية {item.ayahNumber}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={previous}
        disabled={queueIndex <= 0}
        style={styles.iconButton}
        accessibilityLabel="الآية السابقة"
      >
        <Ionicons
          name="play-skip-back"
          size={18}
          color={queueIndex <= 0 ? palette.textMuted : palette.gold}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isPlaying ? pause : resume}
        style={[styles.playButton, { backgroundColor: palette.primary }]}
        accessibilityLabel={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
      >
        {isBuffering ? (
          <ActivityIndicator size="small" color={palette.primaryText} />
        ) : (
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={palette.primaryText} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={next}
        disabled={queueIndex >= queue.length - 1}
        style={styles.iconButton}
        accessibilityLabel="الآية التالية"
      >
        <Ionicons
          name="play-skip-forward"
          size={18}
          color={queueIndex >= queue.length - 1 ? palette.textMuted : palette.gold}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  info: { flex: 1, marginHorizontal: 8 },
  title: { fontFamily: fonts.bold, fontSize: 14, writingDirection: 'rtl', textAlign: 'right' },
  subtitle: { fontFamily: fonts.regular, fontSize: 11, writingDirection: 'rtl', textAlign: 'right', marginTop: 1 },
  iconButton: { paddingHorizontal: 6, paddingVertical: 6 },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
