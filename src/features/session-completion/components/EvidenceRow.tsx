import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens/spacing';

export function EvidenceRow({
  label,
  emoji,
  index,
}: {
  label: string;
  emoji: string;
  index: number;
}): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion ? undefined : FadeIn.delay(200 + index * 80).duration(300);

  return (
    <Animated.View
      entering={entering}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing[2],
        paddingVertical: spacing[1],
      }}
    >
      <Text style={{ fontSize: 13 }}>{emoji}</Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          flex: 1,
          lineHeight: 17,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
