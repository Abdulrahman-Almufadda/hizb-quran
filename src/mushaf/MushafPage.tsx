import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ZoomableView } from '../components/ZoomableView';
import { getAyahByGlobalIndex } from '../db/quranRepository';
import type { Ayah } from '../db/types';
import { useQuranDb } from '../db/useQuranDb';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AyahActions } from './AyahActions';
import { getPageViewBox, highlightRects, locateAyah, type PageAyahSlot } from './mushafGeometry';
import { getLastMushafLoadError, loadMushafPageSvg } from './mushafPageLoader';

// Pages 1-2 use a smaller plate than the rest (~293 x 485); the real per-page viewBox
// comes from the generated geometry so each page fills the screen correctly.
const DEFAULT_ASPECT_RATIO = 293.23 / 485;

type Props = {
  pageNumber: number;
  palette: Palette;
  onZoomChange?: (isZoomed: boolean) => void;
};

type LoadResult = { page: number; xml: string | null };

export function MushafPage({ pageNumber, palette, onZoomChange }: Props): React.JSX.Element {
  const [loaded, setLoaded] = useState<LoadResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [renderFailedPage, setRenderFailedPage] = useState<number | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const db = useQuranDb();
  const [selection, setSelection] = useState<{ slot: PageAyahSlot; ayah: Ayah } | null>(null);

  const viewBox = getPageViewBox(pageNumber);
  const aspectRatio = viewBox ? viewBox.width / viewBox.height : DEFAULT_ASPECT_RATIO;

  const svgXml = loaded?.page === pageNumber ? loaded.xml : null;
  const fetchFailed = loaded?.page === pageNumber && loaded.xml == null;
  const renderFailed = renderFailedPage === pageNumber;
  const failed = fetchFailed || renderFailed;

  useEffect(() => {
    let cancelled = false;
    loadMushafPageSvg(pageNumber).then((xml) => {
      if (!cancelled) setLoaded({ page: pageNumber, xml });
    });
    return () => {
      cancelled = true;
    };
    // `attempt` has no meaning of its own - bumping it is how the retry button
    // forces this effect to run again for the same page.
  }, [pageNumber, attempt]);

  const retry = (): void => {
    setRenderFailedPage(null);
    setLoaded(null);
    setAttempt((a) => a + 1);
  };

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  let renderWidth = containerSize.width;
  let renderHeight = containerSize.height;
  if (containerSize.width > 0 && containerSize.height > 0) {
    const containerRatio = containerSize.width / containerSize.height;
    if (containerRatio > aspectRatio) {
      renderHeight = containerSize.height;
      renderWidth = renderHeight * aspectRatio;
    } else {
      renderWidth = containerSize.width;
      renderHeight = renderWidth / aspectRatio;
    }
  }

  const handleTap = (tapX: number, tapY: number): void => {
    if (!viewBox || renderWidth === 0) return;
    // The page is centred in the container; convert the tap into SVG coordinates.
    const offsetX = (containerSize.width - renderWidth) / 2;
    const offsetY = (containerSize.height - renderHeight) / 2;
    const scale = renderWidth / viewBox.width;
    const slot = locateAyah(pageNumber, (tapX - offsetX) / scale, (tapY - offsetY) / scale);
    if (!slot) {
      setSelection(null);
      return;
    }
    getAyahByGlobalIndex(db, slot.globalIndex).then((ayah) => {
      if (ayah) setSelection({ slot, ayah });
    });
  };

  const rects =
    selection && selection.slot.page === pageNumber && viewBox ? highlightRects(pageNumber, selection.slot.slot) : [];
  const rectScale = viewBox ? renderWidth / viewBox.width : 1;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {failed ? (
        <TouchableOpacity style={styles.center} onPress={retry}>
          <Text style={[styles.errorText, { color: palette.textMuted }]}>تعذر تحميل هذه الصفحة</Text>
          <Text style={[styles.retryText, { color: palette.gold }]}>اضغط لإعادة المحاولة</Text>
          <Text style={[styles.detailText, { color: palette.textMuted }]}>
            {renderFailed ? renderError : getLastMushafLoadError()}
          </Text>
        </TouchableOpacity>
      ) : !svgXml || renderWidth === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : (
        <ZoomableView onZoomChange={onZoomChange} onTap={handleTap}>
          <View style={[styles.svgWrap, { width: renderWidth, height: renderHeight }]}>
            <SvgXml
              xml={svgXml}
              width={renderWidth}
              height={renderHeight}
              onError={(error) => {
                console.error(`[MushafPage] SvgXml failed to render page ${pageNumber}:`, error);
                setRenderError(error instanceof Error ? error.message : String(error));
                setRenderFailedPage(pageNumber);
              }}
            />
            {rects.map((r, i) => (
              <View
                key={i}
                pointerEvents="none"
                style={[
                  styles.highlight,
                  {
                    left: r.x * rectScale,
                    top: r.y * rectScale,
                    width: r.width * rectScale,
                    height: r.height * rectScale,
                    backgroundColor: palette.goldMuted,
                    borderColor: palette.gold,
                  },
                ]}
              />
            ))}
          </View>
        </ZoomableView>
      )}
      <AyahActions ayah={selection?.ayah ?? null} palette={palette} onClose={() => setSelection(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  retryText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  highlight: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  svgWrap: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
});
