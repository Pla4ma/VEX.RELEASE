import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { EtherealSkyBackground } from './ethereal';
import { SerifTitle } from './ethereal';
import { etherealText } from '@/theme/tokens/ethereal-sky';

export function SignedOutOnboardingState(): React.ReactElement {
  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        <SerifTitle
          color={etherealText.heading}
          fontSize={28}
          letterSpacing={-0.5}
          lineHeight={34}
          text="Sign in to start"
        />
        <Text
          color={etherealText.heading}
          fontSize={14}
          style={{ color: etherealText.body, textAlign: 'center' }}
        >
          Your onboarding picks up where you left off once you sign in.
        </Text>
      </View>
    </View>
  );
}