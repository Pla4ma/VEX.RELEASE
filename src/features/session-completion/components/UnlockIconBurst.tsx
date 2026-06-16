import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets, timingPresets } from '../../../theme/tokens/motion';
import { borderRadius } from '../../../theme/tokens/radius';

      const elementStyle_72 = {
  alignItems: 'center',
  backgroundColor: `${color}18`,
  borderColor: `${color}44`,
  borderRadius: borderRadius.full,
  borderWidth: 2,
  height: 88,
  justifyContent: 'center',
  width: 88,
};
export function UnlockIconBurst({
  icon,
  color,
}: {
  icon: string;
  color: string;
}): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      burstScale.value = 1;
      burstOpacity.value = 1;
      return;
    }
    burstScale.value = withSpring(1, {
      damping: springPresets.lively.damping,
      stiffness: springPresets.lively.stiffness,
      mass: springPresets.lively.mass,
    });
    burstOpacity.value = withTiming(1, {
      duration: timingPresets.enter.duration,
      easing: Easing.bezier(...timingPresets.enter.easing),
    });
  }, [isReducedMotion, burstScale, burstOpacity]);

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          },
          burstStyle,
        ]}
      >
        <View
          style={{
            backgroundColor: `${color}22`,
            borderRadius: 999,
            height: 120,
            width: 120,
          }}
        />
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(150).duration(400)}
        style={elementStyle_72}
      >
        <Text style={{ fontSize: 40 }}>{icon}</Text>
      </Animated.View>
    </View>
  );
}
