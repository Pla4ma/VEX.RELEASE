import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScreenHeaderProps {
  statusCopy: string;
}

export function FocusScreenHeader({ statusCopy }: FocusScreenHeaderProps): JSX.Element {
  return (
    <View style={{ gap: 6, marginBottom: 20 }}>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 28,
          fontWeight: '800',
          letterSpacing: -0.6,
          lineHeight: 34,
        }}
      >
        Focus modes
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 19,
        }}
      >
        Choose the shape of this block
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.tertiary,
          fontSize: 12,
          lineHeight: 18,
          marginTop: 8,
        }}
      >
        {statusCopy}
      </Text>
    </View>
  );
}

export default FocusScreenHeader;
