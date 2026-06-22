import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export function VexBrandPill(): React.ReactNode {
  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        height: 32,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 18,
          fontWeight: '900',
          letterSpacing: 1.2,
        }}
      >
        VEX
      </Text>
    </View>
  );
}

export { VexBrandPill }