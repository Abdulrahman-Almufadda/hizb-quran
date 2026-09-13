import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import { MiniPlayer } from '../components/MiniPlayer';
import BookmarksScreen from '../screens/BookmarksScreen';
import LandingScreen from '../screens/LandingScreen';
import ReaderScreen from '../screens/ReaderScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SplashScreen from '../screens/SplashScreen';
import SurahListScreen from '../screens/SurahListScreen';
import { useAppPalette } from '../state/themeStore';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  const { palette, isDark } = useAppPalette();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      primary: palette.gold,
      border: palette.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="SurahList" component={SurahListScreen} />
          <Stack.Screen name="Reader" component={ReaderScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
        <MiniPlayer />
      </View>
    </NavigationContainer>
  );
}
