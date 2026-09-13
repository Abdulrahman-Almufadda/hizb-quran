import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { lightPalette } from '../theme/colors';

export function LoadingFallback(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={lightPalette.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightPalette.background,
  },
});
