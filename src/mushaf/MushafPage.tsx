import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ZoomableView } from '../components/ZoomableView';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';
import { loadMushafPageSvg } from './mushafPageLoader';

// All bundled Mushaf pages share this plate size (viewBox="0 0 212.457 299.236").
const PAGE_ASPECT_RATIO = 212.457 / 299.236;

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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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
    if (containerRatio > PAGE_ASPECT_RATIO) {
      renderHeight = containerSize.height;
      renderWidth = renderHeight * PAGE_ASPECT_RATIO;
    } else {
      renderWidth = containerSize.width;
      renderHeight = renderWidth / PAGE_ASPECT_RATIO;
    }
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {failed ? (
        <TouchableOpacity style={styles.center} onPress={retry}>
          <Text style={[styles.errorText, { color: palette.textMuted }]}>تعذر تحميل هذه الصفحة</Text>
          <Text style={[styles.retryText, { color: palette.gold }]}>اضغط لإعادة المحاولة</Text>
        </TouchableOpacity>
      ) : !svgXml || renderWidth === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.gold} />
        </View>
      ) : (
        <ZoomableView onZoomChange={onZoomChange}>
          <View style={[styles.svgWrap, { width: renderWidth, height: renderHeight }]}>
            <SvgXml
              xml={svgXml}
              width={renderWidth}
              height={renderHeight}
              onError={(error) => {
                console.error(`[MushafPage] SvgXml failed to render page ${pageNumber}:`, error);
                setRenderFailedPage(pageNumber);
              }}
            />
          </View>
        </ZoomableView>
      )}
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
  svgWrap: {
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
});
