import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';

import type { Palette } from '../theme/colors';

type Props = {
  palette: Palette;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({ palette, onPress, style }: Props): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ minWidth: 40, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="رجوع"
    >
      <Ionicons name="chevron-forward" size={24} color={palette.gold} />
    </TouchableOpacity>
  );
}
