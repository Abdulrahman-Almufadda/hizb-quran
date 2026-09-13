import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Palette } from '../theme/colors';
import { fonts, typeScale } from '../theme/typography';
import { splitHighlightedSegments } from '../utils/highlightText';

type Props = {
  ayahNumber: number;
  text: string;
  palette: Palette;
  highlighted?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function AyahLine({ ayahNumber, text, palette, highlighted, onPress, onLongPress }: Props): React.JSX.Element {
  const segments = splitHighlightedSegments(text);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.row, highlighted ? { backgroundColor: palette.goldMuted } : null]}
    >
      <Text style={[styles.verseText, { color: palette.text }]}>
        {segments.map((segment, index) => (
          <Text
            key={index}
            style={segment.highlighted ? { color: palette.highlightRed, fontWeight: '600' } : undefined}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
      <View style={[styles.badge, { borderColor: palette.gold, backgroundColor: palette.goldMuted }]}>
        <Text style={[styles.badgeText, { color: palette.gold }]}>{ayahNumber}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  verseText: {
    flex: 1,
    fontFamily: fonts.quran,
    fontSize: typeScale.ayahBody,
    lineHeight: typeScale.ayahBody * 1.7,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginLeft: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
