import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface CoachLineProps {
  message: string;
}

export function CoachLineView({ message }: CoachLineProps): React.ReactNode {
  return (
    <View style={{ gap: 4, paddingHorizontal: 2 }}>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}
      >
        AI Coach
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 14,
          fontWeight: '500',
          letterSpacing: -0.2,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
