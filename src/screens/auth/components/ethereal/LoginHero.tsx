/**
 * LoginHero — the top brand block of the Login screen.
 * Composes the Ethereal Medallion, Serif "VEX" title, and tagline.
 * Pure presentation.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { EtherealMedallion } from './EtherealMedallion';
import { SerifTitle } from './SerifTitle';

export function LoginHero(): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 24, marginTop: 12 }}>
      <EtherealMedallion size={140} />
      <View style={{ alignItems: 'center', gap: 6 }}>
        <SerifTitle
          color="#0A0A0A"
          fontSize={48}
          letterSpacing={-1.5}
          lineHeight={52}
          startDelayMs={700}
          text="VEX"
        />
        <Text
          color="#0A0A0A"
          fontSize={13}
          fontWeight="600"
          style={{
            color: 'rgba(10, 10, 10, 0.55)',
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
