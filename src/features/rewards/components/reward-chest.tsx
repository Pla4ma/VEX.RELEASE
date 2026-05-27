import React from 'react';
import { View, Text } from 'react-native';

/**
 * Archived component — chest/loot reward UI moved to archive/features/rewards/.
 * Active rewards only track XP/progress/streak via reward-ledger.
 */
export function RewardChest(): React.ReactElement {
  return (
    <View accessibilityLabel="Reward chest" style={{ padding: 16 }}>
      <Text style={{ color: '#aaaacc', fontSize: 13 }}>
        Chest and economy rewards have been moved to the archive.
      </Text>
    </View>
  );
}
