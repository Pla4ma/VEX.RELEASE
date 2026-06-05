import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets } from '../../../theme/tokens/motion';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Platform } from 'react-native';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

/**
 * EditorialCta — a high-gravitas primary action for the Editorial Devotional
 * login. Composition:
 *   - A warm-dark base with a hairline gold border
 *   - A top hairline accent (the "ceremonial rule")
 *   - Centered serif label in small caps, wide letter-spacing
 *   - A slow ceremonial breath (scale 1.0 → 1.012 → 1.0, 5s)
 *   - A one-time shine sweep on press
 *   - Reduced-motion: no breath, no shine
 */

const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);
const SERIF_STACK = Platform.select({
  ios: 'New York',
  android: 'Noto Serif',
  default: 'Georgia',
}) ?? 'Georgia';

interface EditorialCtaProps {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  onPress: () => void;
  delay: number;
}

export function EditorialCta({
  label,
  loadingLabel,
  isLoading,
  onPress,
  delay,
}: EditorialCtaProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { theme } = useTheme();
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const ty = useSharedValue(isReducedMotion ? 0 : 16);
  const breath = useSharedValue(0);
  const shine = useSharedValue(-1);

  useEffect(() => {
    if (isReducedMotion) return;
    op.value = withDelay(delay, withTiming(1, { duration: 900, easing: EASE_CINEMATIC }));
    ty.value = withDelay(delay, withSpring(0, springPresets.settle));
    breath.value = withDelay(
      delay + 400,
      withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        -1,
        true,
      ),
    );
    shine.value = withDelay(
      delay + 800,
      withRepeat(
        withTiming(1, { duration: 4800, easing: EASE_CINEMATIC }),
        -1,
        false,
      ),
    );
  }, [op, ty, breath, shine, delay, isReducedMotion]);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { scale: 1 + breath.value * 0.012 }],
  }));
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value * 520 - 120 }],
  }));
  const shineAlpha = useAnimatedStyle(() => ({
    opacity: shine.value < 0.05 || shine.value > 0.92 ? 0 : 0.8,
  }));

  return (
    <Animated.View style={entryStyle}>
      <Pressable
        accessibilityHint="Authenticates and opens your VEX workspace"
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading }}
        disabled={isLoading}
        onPress={onPress}
        style={({ pressed }) => ({
          borderRadius: 18,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: theme.colors.semantic.editorialDeepBackground,
            borderWidth: 1,
            borderColor: theme.colors.semantic.editorialGoldBorder,
            shadowColor: theme.colors.semantic.editorialGold,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.30,
            shadowRadius: 28,
          }}
        >
          {/* Warm vertical wash */}
          <LinearGradient
            // Warm gradient endpoints for editorial wash
            colors={[theme.colors.semantic.editorialGradientTop, theme.colors.semantic.editorialDeepBackground, theme.colors.semantic.editorialGradientBottom]}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              paddingVertical: 20,
              paddingHorizontal: 24,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 60,
            }}
          >
            {/* Top hairline — the ceremonial rule */}
            <LinearGradient
              colors={['transparent', rgbaColors.rgb_224_184_112_0_85, 'transparent']}
              locations={[0.05, 0.5, 0.95]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
              }}
              pointerEvents="none"
            />
            {/* One-time ceremonial shine sweep */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 60,
                  backgroundColor: rgbaColors.rgb_242_234_217_0_18,
                  transform: [{ skewX: '-18deg' }],
                },
                shineStyle,
                shineAlpha,
              ]}
            />
            <Text
              style={{
                color: theme.colors.semantic.editorialWarmText,
                fontSize: 14,
                fontFamily: SERIF_STACK,
                fontWeight: '600',
                letterSpacing: 4.5,
                textTransform: 'uppercase',
              }}
            >
              {isLoading ? loadingLabel : label}
            </Text>
            {/* Em dash under the label — small editorial flourish */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <View style={{ width: 18, height: 1, backgroundColor: rgbaColors.rgb_224_184_112_0_55 }} />
              <View style={{ width: 3, height: 3, backgroundColor: rgbaColors.rgb_224_184_112_0_85, transform: [{ rotate: '45deg' }] }} />
              <View style={{ width: 18, height: 1, backgroundColor: rgbaColors.rgb_224_184_112_0_55 }} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default EditorialCta;
