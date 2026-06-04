// Boss battle HUD stub
import React from 'react';
import { View, Text } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

export function BossBattleHUD(): React.ReactElement {
  return (
    <View accessibilityLabel="Boss battle" style={{ padding: 16 }}>
      <Text style={{ color: lightColors.text.disabled, fontSize: 13 }}>
        Boss battles have been moved.
      </Text>
    </View>
  );
}
