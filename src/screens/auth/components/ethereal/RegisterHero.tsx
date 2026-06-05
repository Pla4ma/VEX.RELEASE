/**
 * RegisterHero — the brand block at the top of the Register screen.
 * Composes the animated VEX mark and the serif "Create account"
 * title for tonal contrast.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { AnimatedVexMark } from './AnimatedVexMark';
import { SerifTitle } from './SerifTitle';

type RegisterHeroProps = {
  startDelayMs?: number;
};

export function RegisterHero({ startDelayMs = 0 }: RegisterHeroProps): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 18, marginTop: 8 }}>
      <AnimatedVexMark size={104} startDelayMs={startDelayMs} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <SerifTitle
          color="#0A0A0A"
          fontSize={34}
          letterSpacing={-1}
          lineHeight={40}
          text="Create account"
        />
        <Text
          color="#0A0A0A"
          fontSize={13}
          style={{ color: 'rgba(10, 10, 10, 0.62)', textAlign: 'center' }}
        >
          Two fields, then your first protected session.
        </Text>
      </View>
    </View>
  );
}
