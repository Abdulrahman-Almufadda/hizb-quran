import { Ionicons } from '@expo/vector-icons';
import React, { Component, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { lightPalette } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle-outline" size={40} color={lightPalette.gold} style={styles.icon} />
          <Text style={styles.title}>حدث خطأ غير متوقع</Text>
          <Text style={styles.subtitle}>نعتذر عن هذا الإزعاج. يمكنك المحاولة مرة أخرى.</Text>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightPalette.background,
    padding: 24,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: lightPalette.text,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: lightPalette.textMuted,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightPalette.gold,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
