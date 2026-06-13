import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { etherealGlass, etherealText } from '@/theme/tokens/ethereal-sky';
import type { MascotPlacement, MascotSizeConfig } from './VexMascotGuide.tokens';

type MascotSpeechBubbleProps = {
  message: string;
  submessage?: string;
  placement: MascotPlacement;
  config: MascotSizeConfig;
  pulseKey?: string | number;
  reducedMotion: boolean;
  children?: React.ReactNode;
};

export function MascotSpeechBubble({
  message,
  submessage,
  placement,
  config,
  pulseKey,
  reducedMotion,
  children,
}: MascotSpeechBubbleProps): React.JSX.Element {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withSequence(
      withTiming(1.018, { duration: 110 }),
      withTiming(1, { duration: 180 }),
    );
  }, [pulse, pulseKey, reducedMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flex: placement === 'header' ? 0 : 1,
          backgroundColor: etherealGlass.fillStrong,
          borderColor: etherealGlass.border,
          borderRadius: config.bubbleRadius,
          borderWidth: 1,
          gap: 4,
          padding: config.bubblePadding,
          shadowColor: etherealGlass.shadowStrong,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
        },
        pulseStyle,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: placement === 'header' ? '50%' : -5,
          top: placement === 'header' ? -5 : 24,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: etherealGlass.fillStrong,
        }}
      />
      <Text
        fontSize={placement === 'corner' ? 14 : 17}
        fontWeight="800"
        numberOfLines={2}
        style={{ color: etherealText.heading, lineHeight: 22 }}
      >
        {message}
      </Text>
      {submessage ? (
        <Text
          fontSize={13}
          fontWeight="600"
          numberOfLines={2}
          style={{ color: etherealText.subtitle, lineHeight: 18 }}
        >
          {submessage}
        </Text>
      ) : null}
      {children}
    </Animated.View>
  );
}
