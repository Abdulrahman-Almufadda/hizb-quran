import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { getAyahsByPage } from '../db/quranRepository';
import { useQuranDb } from '../db/useQuranDb';
import { GoToPageDialog } from '../mushaf/GoToPageDialog';
import { MushafPage } from '../mushaf/MushafPage';
import { preloadMushafPage } from '../mushaf/mushafPageLoader';
import { TextPage } from '../mushaf/TextPage';
import type { RootStackParamList } from '../navigation/types';
import { useAudioStore } from '../state/audioStore';
import { clampPage, TOTAL_MUSHAF_PAGES, useReaderStore } from '../state/readerStore';
import { useAppPalette } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;

// Pages are listed highest-to-lowest so that swiping right (the forward,
// deeper-into-the-Quran direction in a right-to-left Mushaf) moves from a
// lower page toward a higher one, e.g. from Al-Fatihah toward Al-Baqarah.
const PAGES = Array.from({ length: TOTAL_MUSHAF_PAGES }, (_, i) => TOTAL_MUSHAF_PAGES - i);

function pageToIndex(page: number): number {
  return TOTAL_MUSHAF_PAGES - page;
}

function indexToPage(index: number): number {
  return TOTAL_MUSHAF_PAGES - index;
}

export default function ReaderScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Reader'>>();
  const route = useRoute<ReaderRouteProp>();
  const db = useQuranDb();
  const { palette } = useAppPalette();
  const { width: pageWidth } = useWindowDimensions();
  const playQueue = useAudioStore((s) => s.playQueue);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const audioQueueLength = useAudioStore((s) => s.queue.length);

  const lastReadPage = useReaderStore((s) => s.lastReadPage);
  const setLastReadPage = useReaderStore((s) => s.setLastReadPage);
  const pageMode = useReaderStore((s) => s.pageMode);
  const setPageMode = useReaderStore((s) => s.setPageMode);
  const showBackButton = route.params?.showBackButton ?? navigation.canGoBack();

  const requestedPage = route.params?.initialPage;
  const [page, setPage] = useState(() => clampPage(requestedPage ?? lastReadPage));
  const [appliedRequestedPage, setAppliedRequestedPage] = useState(requestedPage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const listRef = useRef<FlatList<number>>(null);

  if (requestedPage != null && requestedPage !== appliedRequestedPage) {
    setAppliedRequestedPage(requestedPage);
    const clamped = clampPage(requestedPage);
    if (clamped !== page) setPage(clamped);
  }

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: pageToIndex(page), animated: false });
    setLastReadPage(page);
    if (pageMode === 'mushaf') {
      preloadMushafPage(page - 1);
      preloadMushafPage(page + 1);
    }
  }, [page, pageMode, setLastReadPage]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        setLastReadPage(page);
      }
    });
    return () => subscription.remove();
  }, [page, setLastReadPage]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setPage(clampPage(indexToPage(index)));
    },
    [pageWidth]
  );

  const jumpToPage = useCallback((next: number) => {
    setPage(clampPage(next));
  }, []);

  const playCurrentPage = useCallback(async () => {
    const ayahs = await getAyahsByPage(db, page);
    if (ayahs.length === 0) return;
    playQueue(ayahs.map((a) => ({ surahId: a.surahId, ayahNumber: a.ayahNumber })));
  }, [db, page, playQueue]);

  const isPlayingThisReader = isPlaying && audioQueueLength > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        {showBackButton ? (
          <BackButton palette={palette} onPress={() => navigation.goBack()} />
        ) : (
          <View style={styles.headerIconButton} />
        )}
        <Text style={[styles.headerTitle, { color: palette.text }]}>القرآن الكريم</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={playCurrentPage} style={styles.headerIconButton} accessibilityLabel="تشغيل هذه الصفحة">
            <Ionicons
              name={isPlayingThisReader ? 'volume-high' : 'volume-medium-outline'}
              size={22}
              color={palette.gold}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPageMode(pageMode === 'mushaf' ? 'text' : 'mushaf')}
            style={styles.headerIconButton}
            accessibilityLabel="تبديل طريقة العرض"
          >
            <Ionicons name={pageMode === 'mushaf' ? 'text-outline' : 'book-outline'} size={22} color={palette.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SurahList')}
            style={styles.headerIconButton}
            accessibilityLabel="قائمة السور"
          >
            <Ionicons name="list-outline" size={22} color={palette.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerIconButton}
            accessibilityLabel="بحث"
          >
            <Ionicons name="search-outline" size={20} color={palette.gold} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(item) => String(item)}
        horizontal
        pagingEnabled
        scrollEnabled={!isZoomed}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={pageToIndex(page)}
        getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ width: pageWidth }}>
            {pageMode === 'mushaf' ? (
              <MushafPage pageNumber={item} palette={palette} onZoomChange={setIsZoomed} />
            ) : (
              <TextPage pageNumber={item} palette={palette} />
            )}
          </View>
        )}
      />

      <View style={[styles.footer, { borderTopColor: palette.border }]}>
        <TouchableOpacity onPress={() => jumpToPage(page - 1)} disabled={page <= 1} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={18} color={page <= 1 ? palette.textMuted : palette.gold} />
          <Text style={[styles.navButtonText, { color: page <= 1 ? palette.textMuted : palette.gold }]}>السابقة</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Text style={[styles.pageIndicator, { color: palette.text }]}>
            ص {page} / {TOTAL_MUSHAF_PAGES}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => jumpToPage(page + 1)}
          disabled={page >= TOTAL_MUSHAF_PAGES}
          style={styles.navButton}
        >
          <Text style={[styles.navButtonText, { color: page >= TOTAL_MUSHAF_PAGES ? palette.textMuted : palette.gold }]}>
            التالية
          </Text>
          <Ionicons
            name="chevron-back"
            size={18}
            color={page >= TOTAL_MUSHAF_PAGES ? palette.textMuted : palette.gold}
          />
        </TouchableOpacity>
      </View>

      <GoToPageDialog
        visible={pickerVisible}
        currentPage={page}
        palette={palette}
        onCancel={() => setPickerVisible(false)}
        onSubmit={(next) => {
          setPickerVisible(false);
          jumpToPage(next);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerActions: { flexDirection: 'row-reverse' },
  headerIconButton: { minWidth: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  headerTitle: { fontFamily: fonts.bold, fontSize: typeScale.screenTitle, writingDirection: 'rtl' },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navButton: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 8 },
  navButtonText: { fontFamily: fonts.regular, fontSize: 15 },
  pageIndicator: { fontFamily: fonts.bold, fontSize: 15, writingDirection: 'rtl' },
});
