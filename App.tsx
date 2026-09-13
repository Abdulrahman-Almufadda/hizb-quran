import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingFallback } from './src/components/LoadingFallback';
import { DATABASE_NAME, initializeDatabase, quranDatabaseAsset } from './src/db/database';
import RootNavigator from './src/navigation/RootNavigator';
import { fontAssets } from './src/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore: harmless if already hidden or unsupported on this platform.
});

export default function App(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <Suspense fallback={<LoadingFallback />}>
            <SQLiteProvider
              databaseName={DATABASE_NAME}
              assetSource={{ assetId: quranDatabaseAsset }}
              onInit={initializeDatabase}
              useSuspense
            >
              <RootNavigator />
            </SQLiteProvider>
          </Suspense>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
