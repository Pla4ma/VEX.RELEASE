/**
 * LoginHero — the top brand block of the Login screen.
 * Composes the animated VEX mark (stroke-draw SVG) and tagline.
 * Pure presentation.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { AnimatedVexMark } from './AnimatedVexMark';

type LoginHeroProps = {
  startDelayMs?: number;
};

export function LoginHero({ startDelayMs = 0 }: LoginHeroProps): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 24, marginTop: 12 }}>
      <AnimatedVexMark size={130} startDelayMs={startDelayMs} />
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text
          color="#0A0A0A"
          fontSize={13}
          fontWeight="600"
          style={{
            color: 'rgba(10, 10, 10, 0.62)',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Focus, shaped to you
        </Text>
      </View>
    </View>
  );
}
