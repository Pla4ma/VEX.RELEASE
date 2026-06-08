import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';

export function VexBrandPill(): JSX.Element {
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
          color: '#0A1F1A',
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

export default VexBrandPill;
