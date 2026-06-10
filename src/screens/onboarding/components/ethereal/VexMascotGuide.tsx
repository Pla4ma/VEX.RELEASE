import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { etherealButton, etherealGlass, etherealText } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

export type MascotMood =
  | 'default'
  | 'wave'
  | 'pointing'
  | 'thinking'
  | 'encouraging'
  | 'celebrate'
  | 'recovery';

export type MascotSize = 'small' | 'medium' | 'large' | 'inline';
export type MascotPlacement = 'inline' | 'header' | 'corner';

const MOOD_ASSET_MAP: Record<MascotMood, ImageSourcePropType> = {
  default: require('../../../../../MASCOT ASSETS/MASCOT_DEFAULT.png'),
  wave: require('../../../../../MASCOT ASSETS/MASCOT_WAVE.png'),
  pointing: require('../../../../../MASCOT ASSETS/MASCOT_POINTING.png'),
  thinking: require('../../../../../MASCOT ASSETS/MASCOT_THINKING.png'),
  encouraging: require('../../../../../MASCOT ASSETS/MASCOT_HAPPY.png'),
  celebrate: require('../../../../../MASCOT ASSETS/MASCOT_CELEBRATING.png'),
  recovery: require('../../../../../MASCOT ASSETS/MASCOT_RECOVERY.png'),
};

const FALLBACK_MASCOT = require('../../../../../MASCOT ASSETS/MASCOT_DEFAULT.png');

const SIZE_CONFIG: Record<
  MascotSize,
  { width: number; height: number; bubblePadding: number; bubbleRadius: number }
> = {
  small: { width: 56, height: 72, bubblePadding: 12, bubbleRadius: 20 },
  medium: { width: 86, height: 110, bubblePadding: 14, bubbleRadius: 24 },
  large: { width: 130, height: 170, bubblePadding: 18, bubbleRadius: 28 },
  inline: { width: 72, height: 96, bubblePadding: 12, bubbleRadius: 22 },
};

const PLACEMENT_STYLES: Record<MascotPlacement, object> = {
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'column', alignItems: 'center', gap: 10 },
  corner: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
};

function resolveMoodAsset(mood: MascotMood): ImageSourcePropType {
  try {
    return MOOD_ASSET_MAP[mood] ?? FALLBACK_MASCOT;
  } catch {
    return FALLBACK_MASCOT;
  }
}

function useMascotFloatAnimation(mood: MascotMood, reducedMotion: boolean) {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.15);

  useEffect(() => {
    if (reducedMotion) {
      float.value = 0;
      scale.value = 1;
      glow.value = 0.2;
      return;
    }

    const floatDuration = mood === 'wave' ? 1800 : mood === 'celebrate' ? 1600 : 2400;
    float.value = withRepeat(
      withTiming(1, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.985, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.15, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [float, scale, glow, mood, reducedMotion]);

  return { float, scale, glow };
}

type VexMascotGuideProps = {
  mood?: MascotMood;
  message: string;
  submessage?: string;
  size?: MascotSize;
  placement?: MascotPlacement;
  stepLabel?: string;
  onBack?: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  hideActions?: boolean;
  style?: object;
};

export function VexMascotGuide({
  mood = 'default',
  message,
  submessage,
  size = 'medium',
  placement = 'inline',
  stepLabel,
  onBack,
  onReplay,
  onSkip,
  hideActions = false,
  style,
}: VexMascotGuideProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { float, scale } = useMascotFloatAnimation(mood, isReducedMotion);
  const config = SIZE_CONFIG[size];

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: isReducedMotion ? 0 : -4 * float.value },
      { scale: isReducedMotion ? 1 : scale.value },
    ],
  }));

  const asset = useMemo(() => resolveMoodAsset(mood), [mood]);
  const placementStyle = PLACEMENT_STYLES[placement];

  const bubbleFlex = placement === 'header' ? 0 : 1;

  return (
    <View style={[{ width: '100%' }, placementStyle, style]}>
      <Animated.View style={mascotStyle}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`VEX mascot ${mood}`}
          source={asset}
          style={{
            width: config.width,
            height: config.height,
            resizeMode: 'contain',
          }}
        />
      </Animated.View>

      <View
        style={{
          flex: bubbleFlex,
          backgroundColor: etherealGlass.fillStrong,
          borderColor: etherealGlass.border,
          borderRadius: config.bubbleRadius,
          borderWidth: 1,
          gap: 4,
          padding: config.bubblePadding,
          shadowColor: etherealGlass.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }}
      >
        {stepLabel ? (
          <Text
            fontSize={11}
            fontWeight="800"
            style={{ color: etherealButton.emailText, letterSpacing: 1.4 }}
          >
            {stepLabel}
          </Text>
        ) : null}

        <Text
          fontSize={placement === 'corner' ? 14 : 16}
          fontWeight="800"
          style={{ color: etherealText.heading, lineHeight: 22 }}
        >
          {message}
        </Text>

        {submessage ? (
          <Text
            fontSize={13}
            fontWeight="600"
            style={{ color: etherealText.subtitle, lineHeight: 18 }}
          >
            {submessage}
          </Text>
        ) : null}

        {!hideActions && (onBack || onReplay || onSkip) ? (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {onBack ? <GuideAction label="Back" onPress={onBack} /> : null}
            {onReplay ? <GuideAction label="Replay" onPress={onReplay} /> : null}
            {onSkip ? <GuideAction label="Skip guide" onPress={onSkip} strong /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function GuideAction({
  label,
  onPress,
  strong = false,
}: {
  label: string;
  onPress: () => void;
  strong?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={`Activates ${label}`}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 4,
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        fontSize={12}
        fontWeight="800"
        style={{ color: strong ? etherealButton.emailText : etherealText.heading }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
