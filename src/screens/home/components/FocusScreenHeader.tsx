import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScreenHeaderProps {
  statusCopy: string;
}

export function FocusScreenHeader({ statusCopy }: FocusScreenHeaderProps): JSX.Element {
  return (
    <View style={{ gap: 6, marginBottom: 14 }}>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 22,
          fontWeight: '500',
          letterSpacing: -0.2,
          lineHeight: 28,
        }}
      >
        Focus modes
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 13,
          fontWeight: '400',
          lineHeight: 18,
        }}
      >
        Choose the shape of this block
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          lineHeight: 18,
          marginTop: 10,
        }}
      >
        {statusCopy}
      </Text>
    </View>
  );
}

export default FocusScreenHeader;
