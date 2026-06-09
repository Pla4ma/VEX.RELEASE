import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../../components/primitives/Text';
import { etherealGlass, etherealText } from '@/theme/tokens/ethereal-sky';

type OnboardingTitleProps = {
  title?: string;
  subtitle?: string;
};

export function OnboardingTitle({
  title,
  subtitle,
}: OnboardingTitleProps): React.JSX.Element {
  return (
    <View
      style={{
        backgroundColor: etherealGlass.fill,
        borderColor: etherealGlass.border,
        borderRadius: 18,
        borderWidth: 1,
        gap: 6,
        padding: 16,
      }}
    >
      {title ? (
        <Text
          fontSize={30}
          fontWeight="800"
          style={{
            color: etherealText.heading,
            letterSpacing: -0.3,
            lineHeight: 36,
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
