import React, { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { etherealButton, etherealGlass, etherealText } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

const MASCOT = require('../../../../../assets/mascot/vex-mascot.png');

type MascotGuideProps = {
  title: string;
  body: string;
  stepLabel?: string;
  onBack?: () => void;
  onReplay?: () => void;
  onSkip?: () => void;
  compact?: boolean;
};

export function MascotGuide({
  title,
  body,
  stepLabel,
  onBack,
  onReplay,
  onSkip,
  compact = false,
}: MascotGuideProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const float = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    float.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [float, isReducedMotion]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: isReducedMotion ? 0 : -6 * float.value }],
  }));

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        width: '100%',
      }}
    >
      <Animated.View style={mascotStyle}>
        <Image
          accessibilityIgnoresInvertColors
          source={MASCOT}
          style={{
            height: compact ? 86 : 112,
            resizeMode: 'contain',
            width: compact ? 66 : 86,
          }}
        />
      </Animated.View>
      <View
        style={{
          backgroundColor: etherealGlass.fillStrong,
          borderColor: etherealGlass.border,
          borderRadius: 22,
          borderWidth: 1,
          flex: 1,
          gap: 6,
          padding: 14,
        }}
      >
        {stepLabel ? (
          <Text fontSize={11} fontWeight="800" style={{ color: etherealButton.emailText, letterSpacing: 1.4 }}>
            {stepLabel}
          </Text>
        ) : null}
        <Text fontSize={16} fontWeight="800" style={{ color: etherealText.heading }}>
          {title}
        </Text>
        <Text fontSize={13} fontWeight="600" style={{ color: etherealText.subtitle, lineHeight: 18 }}>
          {body}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          {onBack ? <GuideAction label="Back" onPress={onBack} /> : null}
          {onReplay ? <GuideAction label="Replay" onPress={onReplay} /> : null}
          {onSkip ? <GuideAction label="Skip guide" onPress={onSkip} strong /> : null}
        </View>
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
