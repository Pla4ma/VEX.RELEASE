import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { LoginHero } from './LoginHero';

type RegisterHeroProps = {
  startDelayMs?: number;
};

export function RegisterHero({
  startDelayMs = 0,
}: RegisterHeroProps): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 22 }}>
      <LoginHero startDelayMs={startDelayMs} />
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text
          color={etherealText.heading}
          fontSize={40}
          fontWeight="800"
          style={{ color: etherealText.heading, letterSpacing: -0.4 }}
        >
          Create account
        </Text>
        <Text
          color={etherealText.subtitle}
          fontSize={18}
          style={{ color: etherealText.subtitle, textAlign: 'center', lineHeight: 26 }}
        >
          Two fields, then your first protected session.
        </Text>
      </View>
    </View>
  );
}
