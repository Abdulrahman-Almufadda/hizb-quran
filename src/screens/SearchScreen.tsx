import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AyahLine } from '../components/AyahLine';
import { BackButton } from '../components/BackButton';
import { getFirstPageOfSurah, searchAyahs, searchSurahsByName } from '../db/quranRepository';
import type { Ayah, Surah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import type { RootStackParamList } from '../navigation/types';
import { useAppPalette } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';

type Section =
  | { title: string; kind: 'surahs'; data: Surah[] }
  | { title: string; kind: 'ayahs'; data: Ayah[] };

const DEBOUNCE_MS = 250;

export default function SearchScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Search'>>();
  const db = useQuranDb();
  const { palette } = useAppPalette();

  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!trimmedQuery) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const [surahResults, ayahResults] = await Promise.all([
        searchSurahsByName(db, trimmedQuery),
        searchAyahs(db, trimmedQuery),
      ]);
      setSurahs(surahResults);
      setAyahs(ayahResults);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [db, trimmedQuery]);

  const openSurah = async (surah: Surah): Promise<void> => {
    const page = await getFirstPageOfSurah(db, surah.id);
    navigation.navigate('Reader', { initialPage: page });
  };

  const openAyah = (ayah: Ayah): void => {
    navigation.navigate('Reader', { initialPage: ayah.page });
  };

  const sections: Section[] = trimmedQuery
    ? [
        ...(surahs.length > 0 ? [{ title: 'السور', kind: 'surahs' as const, data: surahs }] : []),
        ...(ayahs.length > 0 ? [{ title: 'الآيات', kind: 'ayahs' as const, data: ayahs }] : []),
      ]
    : [];

  const hasNoResults = trimmedQuery.length > 0 && !loading && sections.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <BackButton palette={palette} onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: palette.text }]}>بحث في القرآن</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchInputWrap, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <Ionicons name="search-outline" size={16} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="اكتب كلمة أو اسم سورة..."
            placeholderTextColor={palette.textMuted}
            autoFocus
            style={[styles.searchInput, { color: palette.text }]}
            textAlign="right"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : hasNoResults ? (
        <View style={styles.center}>
          <Text style={{ color: palette.textMuted, fontFamily: fonts.regular }}>لا توجد نتائج</Text>
        </View>
      ) : (
        <SectionList<Surah | Ayah, Section>
          sections={sections}
          keyExtractor={(item, index) => `${'ayahNumber' in item ? 'a' : 's'}-${item.id}-${index}`}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: palette.gold, backgroundColor: palette.background }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) =>
            'ayahNumber' in item ? (
              <View style={styles.ayahRow}>
                <AyahLine
                  ayahNumber={item.ayahNumber}
                  text={item.textAr}
                  palette={palette}
                  onPress={() => openAyah(item)}
                />
              </View>
            ) : (
              <TouchableOpacity style={styles.surahRow} onPress={() => openSurah(item)}>
                <View>
                  <Text style={[styles.surahName, { color: palette.text }]}>{item.nameAr}</Text>
                  <Text style={[styles.surahMeta, { color: palette.textMuted }]}>{item.ayahCount} آية</Text>
                </View>
                <Ionicons name="chevron-back" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerButton: { minWidth: 40 },
  headerTitle: { fontFamily: fonts.bold, fontSize: typeScale.screenTitle, writingDirection: 'rtl' },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInputWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 16,
    writingDirection: 'rtl',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: 14,
    writingDirection: 'rtl',
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  surahRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  surahName: { fontFamily: fonts.quran, fontSize: typeScale.surahTitle, writingDirection: 'rtl' },
  surahMeta: { fontFamily: fonts.regular, fontSize: 13 },
  ayahRow: { paddingHorizontal: 8 },
});
