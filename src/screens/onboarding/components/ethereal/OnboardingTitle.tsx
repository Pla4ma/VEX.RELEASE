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
    <View style={{ gap: 3 }}>
      {title ? (
        <Text
          fontSize={26}
          fontWeight="800"
          style={{
            color: etherealText.heading,
            letterSpacing: -0.3,
            lineHeight: 31,
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          fontSize={14}
          fontWeight="600"
          numberOfLines={2}
          style={{ color: etherealText.subtitle, lineHeight: 19 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
