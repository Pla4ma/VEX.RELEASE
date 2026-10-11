// Boss battle HUD stub
import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexFire } from '../../../theme/tokens/vex-fire';

export function BossBattleHUD(): React.ReactElement {
  return (
    <View accessibilityLabel="Boss battle" style={{ padding: 16 }}>
      <Text variant="caption" color={vexFire.textMuted}>
        Momentum encounters are now part of your focus loop.
      </Text>
    </View>
  );
}
