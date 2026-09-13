import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickRandomAyah } from '../data/curatedAyahs';
import type { RootStackParamList } from '../navigation/types';
import { useReaderStore } from '../state/readerStore';
import { useAppPalette } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';

const GOLD_BUTTON_TEXT = '#241C0E';

export default function LandingScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Landing'>>();
  const { palette, isDark } = useAppPalette();
  const ayah = useMemo(() => pickRandomAyah(), []);
  const lastReadPage = useReaderStore((s) => s.lastReadPage);

  const goToLastPage = (): void => {
    navigation.replace('Reader', { initialPage: lastReadPage, showBackButton: false });
  };

  const goToFirstPage = (): void => {
    navigation.replace('Reader', { initialPage: 1, showBackButton: false });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.gold }]}>القرآن الكريم</Text>
          <View style={[styles.headerRule, { backgroundColor: palette.gold }]} />
        </View>

        <View style={styles.spacer} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              shadowOpacity: isDark ? 0 : 0.08,
            },
          ]}
        >
          <Ionicons name="sparkles-outline" size={22} color={palette.gold} style={styles.quoteMark} />
          <Text style={[styles.ayahText, { color: palette.text }]}>{ayah.text}</Text>
          <View style={[styles.cardRule, { backgroundColor: palette.gold }]} />
          <Text style={[styles.ayahRef, { color: palette.gold }]}>
            سورة {ayah.surah} — الآية {ayah.number}
          </Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: palette.gold }]}
          onPress={goToLastPage}
          accessibilityRole="button"
        >
          <Ionicons name="bookmark" size={18} color={GOLD_BUTTON_TEXT} />
          <Text style={styles.primaryButtonText}>اذهب لآخر صفحة مقروءة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: palette.gold }]}
          onPress={goToFirstPage}
          accessibilityRole="button"
        >
          <Ionicons name="book-outline" size={17} color={palette.gold} />
          <Text style={[styles.secondaryButtonText, { color: palette.gold }]}>ابدأ من أول المصحف</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('SurahList')}
          accessibilityRole="button"
        >
          <View>
            <Text style={[styles.linkButtonText, { color: palette.text }]}>تصفح السور</Text>
          </View>
          <Ionicons name="chevron-back" size={14} color={palette.text} style={styles.linkButtonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: typeScale.ayahBodyLarge + 6,
    writingDirection: 'rtl',
  },
  headerRule: {
    height: 1.5,
    width: '100%',
    marginTop: 8,
    opacity: 0.4,
  },
  spacer: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  quoteMark: {
    opacity: 0.7,
    marginBottom: 12,
  },
  ayahText: {
    fontFamily: fonts.quran,
    fontSize: typeScale.ayahBody,
    lineHeight: typeScale.ayahBody * 1.9,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  cardRule: {
    height: 1,
    width: '100%',
    opacity: 0.25,
    marginTop: 20,
    marginBottom: 14,
  },
  ayahRef: {
    fontFamily: fonts.bold,
    fontSize: 15,
    writingDirection: 'rtl',
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  primaryButtonText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: GOLD_BUTTON_TEXT,
    writingDirection: 'rtl',
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 12,
  },
  secondaryButtonText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    writingDirection: 'rtl',
  },
  linkButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  linkButtonText: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    writingDirection: 'rtl',
  },
  linkButtonIcon: {
    marginLeft: 4,
  },
});
