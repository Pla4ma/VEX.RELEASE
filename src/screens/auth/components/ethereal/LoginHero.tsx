import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Text } from '../../../../components/primitives/Text';
import { etherealButton, etherealText } from '@/theme/tokens/ethereal-sky';

type LoginHeroProps = {
  startDelayMs?: number;
};

function VexWordmark(): React.JSX.Element {
  return (
    <Svg width={190} height={42} viewBox="0 0 190 42">
      <Path d="M0 0h13l13 25L39 0h13L31 38H21L0 0Z" fill={etherealText.heading} />
      <Rect x="74" y="0" width="42" height="8" rx="3" fill={etherealText.heading} />
      <Rect x="74" y="15" width="36" height="8" rx="3" fill={etherealText.heading} />
      <Rect x="74" y="30" width="42" height="8" rx="3" fill={etherealText.heading} />
      <Path d="M139 0h14l10 12L173 0h14l-17 20 20 18h-15l-12-11-12 11h-15l20-18L139 0Z" fill={etherealText.heading} />
    </Svg>
  );
}

export function LoginHero({ startDelayMs: _startDelayMs = 0 }: LoginHeroProps): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 9 }}>
      <VexWordmark />
      <Text
        color={etherealText.subtitle}
        fontSize={18}
        fontWeight="600"
        style={{ color: etherealText.subtitle }}
      >
        Focus adapts to <Text fontSize={18} fontWeight="700" style={{ color: etherealButton.emailText }}>you.</Text>
      </Text>
      <Text
        fontSize={13}
        fontWeight="600"
        style={{ color: etherealText.muted, marginTop: 10 }}
      >
        One clean block. Endless momentum.
      </Text>
    </View>
  );
}
