import React, { useEffect, useState, type ReactNode } from 'react';
import { useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { BackdropBlur, Canvas, Group, RoundedRect } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets } from '../../../theme/tokens/motion';
import { lightColors } from '@/theme/tokens/colors';

/**
 * VexDevotionalCard — a true glass card for the Editorial Devotional login.
 *
 * Three stacked layers:
 *   1. A measured outer View (its size becomes the canvas size).
 *   2. A Skia canvas underneath the content running a real Gaussian
 *      BackdropBlur on whatever is behind the card. This is real GPU blur,
 *      not a fake opacity overlay.
 *   3. A Reanimated layer on top with the editorial frame: warm wash,
 *      hairline border, top hairline accent, slow light sweep.
 *
 * The card width tracks the screen with editorial side margins and the
 * height is determined by its content via onLayout.
 */

const EASE_EDITORIAL = Easing.bezier(0.22, 1, 0.36, 1);

interface VexDevotionalCardProps {
  children: ReactNode;
  borderRadius?: number;
  innerPadding?: number;
  delay?: number;
  blurRadius?: number;
  style?: { marginTop?: number; marginBottom?: number };
  minHeight?: number;
}

export function VexDevotionalCard({
  children,
  borderRadius = 24,
  innerPadding = 26,
  delay = 0,
  blurRadius = 28,
  style,
  minHeight = 220,
}: VexDevotionalCardProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { width } = useWindowDimensions();
  const cardMaxWidth = Math.min(width - 36, 460);

  const [size, setSize] = useState<{ w: number; h: number }>({ w: cardMaxWidth, h: minHeight });

  const onLayout = (e: LayoutChangeEvent): void => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && h > 0) setSize({ w, h });
  };

  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const ty = useSharedValue(isReducedMotion ? 0 : 22);
  const sheen = useSharedValue(-1);

  useEffect(() => {
    if (isReducedMotion) return;
    op.value = withDelay(delay, withTiming(1, { duration: 900, easing: EASE_EDITORIAL }));
    ty.value = withDelay(delay, withSpring(0, springPresets.settle));
    sheen.value = withDelay(
      delay + 1400,
      withTiming(1, { duration: 6400, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
    );
  }, [op, ty, sheen, delay, isReducedMotion]);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheen.value * (size.w + 160) - 80 }],
  }));
  const sheenAlpha = useAnimatedStyle(() => ({
    opacity: sheen.value < 0.05 || sheen.value > 0.95 ? 0 : 0.9,
  }));

  return (
    <Animated.View style={entryStyle}>
      <View
        onLayout={onLayout}
        style={[
          {
            borderRadius,
            backgroundColor: 'rgba(17, 11, 7, 0.42)',
            marginTop: style?.marginTop ?? 0,
            marginBottom: style?.marginBottom ?? 0,
            overflow: 'hidden',
            minHeight,
            shadowColor: lightColors.text.primary,
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.55,
            shadowRadius: 36,
            borderWidth: 1,
            borderColor: 'rgba(242,234,217,0.10)',
          },
        ]}
      >
        {/* Layer 1 — Skia real backdrop blur */}
        {size.h > 0 && (
          <Canvas
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size.w,
              height: size.h,
            }}
          >
            <Group>
              <RoundedRect
                x={0}
                y={0}
                width={size.w}
                height={size.h}
                r={borderRadius}
              >
                <BackdropBlur blur={blurRadius} />
              </RoundedRect>
            </Group>
          </Canvas>
        )}

        {/* Layer 2 — editorial frame */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <LinearGradient
            colors={['rgba(200,160,98,0.10)', 'rgba(200,160,98,0)']}
            locations={[0, 0.7]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.30)']}
            locations={[0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(224,184,112,0.55)', 'transparent']}
            locations={[0.1, 0.5, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1 }}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 80,
                backgroundColor: 'rgba(242,234,217,0.06)',
                transform: [{ skewX: '-18deg' }],
              },
              sheenStyle,
              sheenAlpha,
            ]}
          />
        </View>

        {/* Layer 3 — content */}
        <View style={{ padding: innerPadding }}>{children}</View>
      </View>
    </Animated.View>
  );
}

export default VexDevotionalCard;
