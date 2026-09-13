import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { getBookmarks, removeBookmarkById } from '../db/bookmarksRepository';
import { getPageForAyah, getSurahs } from '../db/quranRepository';
import type { Bookmark, Surah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import type { RootStackParamList } from '../navigation/types';
import { useAppPalette } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';

type Row = Bookmark & { surahName: string };

export default function BookmarksScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Bookmarks'>>();
  const db = useQuranDb();
  const { palette } = useAppPalette();

  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const [bookmarks, surahs] = await Promise.all([getBookmarks(db), getSurahs(db)]);
    const surahById = new Map<number, Surah>(surahs.map((s) => [s.id, s]));
    setRows(
      bookmarks.map((b) => ({
        ...b,
        surahName: surahById.get(b.surahId)?.nameAr ?? `سورة ${b.surahId}`,
      }))
    );
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openBookmark = async (row: Row): Promise<void> => {
    const page = await getPageForAyah(db, row.surahId, row.ayahNumber);
    navigation.navigate('Reader', { initialPage: page });
  };

  const deleteBookmark = async (row: Row): Promise<void> => {
    await removeBookmarkById(db, row.id);
    setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <BackButton palette={palette} onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: palette.text }]}>العلامات المرجعية</Text>
        <View style={styles.headerButton} />
      </View>

      {rows == null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={40} color={palette.border} />
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>لا توجد علامات مرجعية بعد</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: palette.border }]} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openBookmark(item)}>
              <View style={[styles.badge, { backgroundColor: palette.goldMuted }]}>
                <Ionicons name="bookmark" size={16} color={palette.gold} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.surahName, { color: palette.text }]}>{item.surahName}</Text>
                <Text style={[styles.ayahRef, { color: palette.textMuted }]}>الآية {item.ayahNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  deleteBookmark(item);
                }}
                style={styles.deleteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="حذف العلامة المرجعية"
              >
                <Ionicons name="trash-outline" size={18} color={palette.danger} />
              </TouchableOpacity>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontFamily: fonts.regular, fontSize: 15 },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, alignItems: 'flex-end' },
  surahName: { fontFamily: fonts.quran, fontSize: typeScale.surahTitle, writingDirection: 'rtl' },
  ayahRef: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2, writingDirection: 'rtl' },
  deleteButton: { paddingHorizontal: 4 },
});
