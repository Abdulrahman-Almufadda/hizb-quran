import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Ayah } from '../db/types';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  ayah: Ayah | null;
  surahName: string | null;
  isBookmarked: boolean;
  palette: Palette;
  onClose: () => void;
  onToggleBookmark: () => void;
  onCopy: () => void;
  onShare: () => void;
  onPlayAyah: () => void;
  onPlaySurahFromHere: () => void;
};

type RowProps = { icon: IconName; label: string; palette: Palette; onPress: () => void };

function Row({ icon, label, palette, onPress }: RowProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.rowIconChip, { backgroundColor: palette.goldMuted }]}>
        <Ionicons name={icon} size={18} color={palette.gold} />
      </View>
      <Text style={[styles.rowText, { color: palette.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AyahActionSheet({
  ayah,
  surahName,
  isBookmarked,
  palette,
  onClose,
  onToggleBookmark,
  onCopy,
  onShare,
  onPlayAyah,
  onPlaySurahFromHere,
}: Props): React.JSX.Element {
  return (
    <Modal visible={ayah != null} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={[styles.backdrop, { backgroundColor: palette.overlay }]} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.grabber, { backgroundColor: palette.border }]} />
          {ayah ? (
            <Text style={[styles.title, { color: palette.textMuted }]}>
              {surahName ?? ''} — الآية {ayah.ayahNumber}
            </Text>
          ) : null}

          <Row icon="play-circle-outline" label="تشغيل الآية" palette={palette} onPress={onPlayAyah} />
          <Row icon="albums-outline" label="تشغيل السورة من هنا" palette={palette} onPress={onPlaySurahFromHere} />
          <Row
            icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            label={isBookmarked ? 'إزالة العلامة المرجعية' : 'إضافة علامة مرجعية'}
            palette={palette}
            onPress={onToggleBookmark}
          />
          <Row icon="copy-outline" label="نسخ الآية" palette={palette} onPress={onCopy} />
          <Row icon="share-social-outline" label="مشاركة الآية" palette={palette} onPress={onShare} />

          <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
            <Text style={[styles.cancelText, { color: palette.textMuted }]}>إغلاق</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    writingDirection: 'rtl',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  rowIconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    writingDirection: 'rtl',
  },
  cancelRow: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
