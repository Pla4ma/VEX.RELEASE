import React, { useEffect, useMemo } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import {
  MOOD_ASSET_MAP,
  FALLBACK_MASCOT,
  SIZE_CONFIG,
  PLACEMENT_STYLES,
} from './VexMascotGuide.tokens';
import type { MascotMood, MascotSize, MascotPlacement } from './VexMascotGuide.tokens';
import { GuideAction } from './GuideAction';

function resolveMoodAsset(mood: MascotMood) {
  try {
    return MOOD_ASSET_MAP[mood] ?? FALLBACK_MASCOT;
  } catch {
    return FALLBACK_MASCOT;
  }
}

function useMascotFloatAnimation(mood: MascotMood, reducedMotion: boolean) {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      float.value = 0;
      scale.value = 1;
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
  }, [float, scale, mood, reducedMotion]);

  return { float, scale };
}

type VexMascotGuideProps = {
  mood?: MascotMood;
  message: string;
  submessage?: string;
  size?: MascotSize;
  placement?: MascotPlacement;
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
  size = 'question',
  placement = 'inline',
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
          backgroundColor: 'rgba(255,255,255,0.86)',
          borderColor: 'rgba(255,255,255,0.75)',
          borderRadius: config.bubbleRadius,
          borderWidth: 1,
          gap: 4,
          padding: config.bubblePadding,
          shadowColor: 'rgba(13,76,65,0.12)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
        }}
      >
        <Text
          fontSize={placement === 'corner' ? 14 : 17}
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
