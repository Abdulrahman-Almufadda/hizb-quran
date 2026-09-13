import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { getFirstPageOfSurah, getSurahs } from '../db/quranRepository';
import type { Surah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import type { RootStackParamList } from '../navigation/types';
import { useAppPalette } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';
import { normalizeArabic } from '../utils/arabicNormalize';

export default function SurahListScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'SurahList'>>();
  const db = useQuranDb();
  const { palette } = useAppPalette();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSurahs(db).then((list) => {
      if (!cancelled) {
        setSurahs(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return surahs;
    const normalizedQuery = normalizeArabic(trimmed).toLowerCase();
    return surahs.filter(
      (s) => normalizeArabic(s.nameAr).includes(normalizedQuery) || (s.nameEn ?? '').toLowerCase().includes(normalizedQuery)
    );
  }, [surahs, query]);

  const openSurah = async (surah: Surah): Promise<void> => {
    const page = await getFirstPageOfSurah(db, surah.id);
    navigation.navigate('Reader', { initialPage: page });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <BackButton palette={palette} onPress={() => navigation.goBack()} />
        ) : (
          <View style={styles.headerButton} />
        )}
        <Text style={[styles.headerTitle, { color: palette.text }]}>قائمة السور</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchInputWrap, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <Ionicons name="search-outline" size={16} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن سورة..."
            placeholderTextColor={palette.textMuted}
            style={[styles.searchInput, { color: palette.text }]}
            textAlign="right"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: palette.border }]} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: palette.textMuted, fontFamily: fonts.regular }}>لا توجد نتائج</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openSurah(item)}>
              <View style={[styles.badge, { backgroundColor: palette.goldMuted }]}>
                <Text style={[styles.badgeText, { color: palette.gold }]}>{item.id}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.surahName, { color: palette.text }]}>{item.nameAr}</Text>
                <Text style={[styles.ayahCount, { color: palette.textMuted }]}>{item.ayahCount} آية</Text>
              </View>
              <Ionicons name="chevron-back" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          )}
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
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 14 },
  rowText: { flex: 1, alignItems: 'flex-end' },
  surahName: { fontFamily: fonts.quran, fontSize: typeScale.surahTitle, writingDirection: 'rtl' },
  ayahCount: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2, writingDirection: 'rtl' },
});
