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
    <View style={{ alignItems: 'center', gap: 16 }}>
      <LoginHero startDelayMs={startDelayMs} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text
          color={etherealText.heading}
          fontSize={34}
          fontWeight="800"
          style={{ color: etherealText.heading }}
          textAlign="center"
        >
          Create account
        </Text>
        <Text
          color={etherealText.subtitle}
          fontSize={17}
          style={{ color: etherealText.subtitle, textAlign: 'center', lineHeight: 24 }}
        >
          Two fields, then your first protected session.
        </Text>
      </View>
    </View>
  );
}
