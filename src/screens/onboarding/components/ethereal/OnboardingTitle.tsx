/**
 * OnboardingTitle — the title + subtitle block at the top of each
 * onboarding step.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';

type OnboardingTitleProps = {
  title?: string;
  subtitle?: string;
};

export function OnboardingTitle({
  title,
  subtitle,
}: OnboardingTitleProps): React.JSX.Element {
  return (
    <View style={{ marginTop: 12, gap: 4 }}>
      {title ? (
        <Text
          fontSize={32}
          fontWeight="500"
          style={{
            color: '#0A0A0A',
            letterSpacing: -0.5,
            lineHeight: 38,
            fontFamily: 'serif',
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          fontSize={14}
          style={{ color: 'rgba(10, 10, 10, 0.65)', lineHeight: 20 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
