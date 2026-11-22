import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Ayah } from '../db/types';
import { getTafsir, TAFSIR_SOURCE_CREDIT, TAFSIR_SOURCE_NAME } from '../tafsir/tafsirRepository';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  ayah: Ayah | null;
  surahName: string | null;
  palette: Palette;
  onClose: () => void;
};

export function TafsirModal({ ayah, surahName, palette, onClose }: Props): React.JSX.Element {
  const tafsir = useMemo(() => (ayah ? getTafsir(ayah.surahId, ayah.ayahNumber) : null), [ayah]);

  return (
    <Modal visible={ayah != null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="إغلاق">
            <Ionicons name="close" size={24} color={palette.gold} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: palette.text }]}>
            {surahName ?? ''} — الآية {ayah?.ayahNumber}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {ayah ? (
            <View style={[styles.ayahCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.ayahText, { color: palette.text }]}>{ayah.textAr}</Text>
            </View>
          ) : null}

          <Text style={[styles.sectionLabel, { color: palette.gold }]}>{TAFSIR_SOURCE_NAME}</Text>
          <Text style={[styles.tafsirText, { color: palette.text }]}>
            {tafsir ?? 'لا يوجد تفسير متاح لهذه الآية.'}
          </Text>
          <Text style={[styles.credit, { color: palette.textMuted }]}>المصدر: {TAFSIR_SOURCE_CREDIT}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, writingDirection: 'rtl' },
  content: { padding: 16, paddingBottom: 40 },
  ayahCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, marginBottom: 20 },
  ayahText: { fontFamily: fonts.quran, fontSize: 22, lineHeight: 40, textAlign: 'center', writingDirection: 'rtl' },
  sectionLabel: { fontFamily: fonts.bold, fontSize: 15, textAlign: 'right', writingDirection: 'rtl', marginBottom: 8 },
  tafsirText: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 32, textAlign: 'right', writingDirection: 'rtl' },
  credit: { fontFamily: fonts.regular, fontSize: 12, textAlign: 'right', writingDirection: 'rtl', marginTop: 24 },
});
