import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export function VexBrandPill(): JSX.Element {
  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        height: 38,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 21,
          fontWeight: '500',
          letterSpacing: 3.2,
        }}
      >
        VEX
      </Text>
    </View>
  );
}

export default VexBrandPill;
