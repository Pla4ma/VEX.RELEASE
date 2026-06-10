import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealText } from '@/theme/tokens/ethereal-sky';

type OnboardingTitleProps = {
  title?: string;
  subtitle?: string;
};

export function OnboardingTitle({
  title,
  subtitle,
}: OnboardingTitleProps): React.JSX.Element {
  return (
    <View style={{ gap: 6, marginTop: 4, marginBottom: 4 }}>
      {title ? (
        <Text
          fontSize={28}
          fontWeight="800"
          style={{
            color: etherealText.heading,
            letterSpacing: -0.3,
            lineHeight: 34,
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          fontSize={15}
          fontWeight="600"
          style={{ color: etherealText.subtitle, lineHeight: 22 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
