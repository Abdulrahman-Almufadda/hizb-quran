import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { useAppPalette } from '../state/themeStore';
import { fonts } from '../theme/typography';

const ICON = require('../../assets/quran_icon.png');
const SPLASH_DURATION_MS = 800;

export default function SplashScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Splash'>>();
  const { palette } = useAppPalette();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Landing');
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Image source={ICON} style={styles.icon} resizeMode="contain" />
      <Text style={[styles.title, { color: palette.text }]}>حزب</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
  },
});
