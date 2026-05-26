import React from 'react';
import { View, Text } from 'react-native';

export function RewardChest(): React.ReactElement {
  return (
    <View accessibilityLabel="Reward chest" style={{ padding: 16 }}>
      <Text style={{ color: '#aaaacc', fontSize: 13 }}>Rewards have moved.</Text>
    </View>
  );
}
