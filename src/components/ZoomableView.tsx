import React, { useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Props = {
  children: ReactNode;
  onZoomChange?: (isZoomed: boolean) => void;
};

export function ZoomableView({ children, onZoomChange }: Props): React.JSX.Element {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Mirrors the zoom state as plain React state (not just a shared value) so the
  // pan gesture below can be reconfigured: while zoomed out, panning stays a
  // 2-finger gesture so it never competes with the reader's 1-finger page swipe;
  // once zoomed in, the reader's swipe is disabled anyway (see onZoomChange in
  // ReaderScreen), so a single finger is free to pan the zoomed page around.
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const reportZoom = (isZoomed: boolean): void => {
    setIsZoomedIn(isZoomed);
    onZoomChange?.(isZoomed);
  };

  const resetZoom = (): void => {
    'worklet';
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(reportZoom)(false);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= MIN_SCALE) {
        resetZoom();
      } else {
        runOnJS(reportZoom)(true);
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(isZoomedIn ? 1 : 2)
    .onUpdate((event) => {
      if (savedScale.value <= MIN_SCALE) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value > MIN_SCALE) {
        resetZoom();
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
        runOnJS(reportZoom)(true);
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
