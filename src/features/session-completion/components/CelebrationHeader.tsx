import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens';

interface CelebrationHeaderProps {
  featureColor: string;
  featureName: string;
  featureDescription: string;
}

export function CelebrationHeader({
  featureColor,
  featureName,
  featureDescription,
}: CelebrationHeaderProps): JSX.Element {
  return (
    <>
      <View
        style={{
          backgroundColor: `${featureColor}22`,
          borderColor: `${featureColor}55`,
          borderRadius: 999,
          borderWidth: 1,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
        }}
      >
        <Text
          style={{
            color: featureColor,
            fontSize: 9,
            fontWeight: '900',
            letterSpacing: 2,
          }}
        >
          NEW FEATURE UNLOCKED
        </Text>
      </View>

      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 26,
          fontWeight: '900',
          letterSpacing: -0.5,
          textAlign: 'center',
        }}
      >
        {featureName}
      </Text>

      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 14,
          lineHeight: 20,
          textAlign: 'center',
        }}
      >
        {featureDescription}
      </Text>
    </>
  );
}
