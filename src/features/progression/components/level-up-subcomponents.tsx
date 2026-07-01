import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { ConfettiPiece } from './level-up-types';
import { levelUpStyles as styles } from './level-up-styles';

interface ConfettiFieldProps {
  confetti: ConfettiPiece[];
  showConfetti: boolean;
  screenHeight: number;
}

export const ConfettiField: React.ComponentType<ConfettiFieldProps> = ({
  confetti,
  showConfetti,
  screenHeight,
}) => {
  if (!showConfetti) {
    return null;
  }
  return (
    <>
      {confetti.map((piece) => (
        <View
          key={piece.id}
          style={[
            styles.confetti,
            {
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [
                { rotate: `${piece.rotation}deg` },
                { translateY: piece.y + screenHeight + 100 },
              ],
            },
          ]}
        />
      ))}
    </>
  );
};

interface RewardsSectionProps {
  rewards: Array<{ type: string; amount: number; itemName?: string }>;
}

export const RewardsSection: React.ComponentType<RewardsSectionProps> = ({ rewards }) => {
  if (rewards.length === 0) {
    return null;
  }
  return (
    <View style={styles.rewardsSection}>
      <Text style={styles.rewardsLabel}>REWARDS</Text>
      <View style={styles.rewardsRow}>
        {rewards.map((reward, index) => (
          <View key={`reward-${reward.type}-${reward.amount}-${index}`} style={styles.rewardBadge}>
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.2)',
                  'rgba(255,255,255,0.1)',
                ]}
              style={styles.rewardGradient}
            >
              <Text style={styles.rewardIcon}>
                {reward.type === 'XP'
                  ? 'XP'
                  : reward.type === 'COINS'
                    ? '$'
                    : reward.type === 'GEMS'
                      ? 'G'
                      : '?'}
              </Text>
              <Text style={styles.rewardAmount}>+{reward.amount}</Text>
              <Text style={styles.rewardType}>{reward.type}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );
};

interface UnlocksSectionProps {
  unlocks: string[];
}

export const UnlocksSection: React.ComponentType<UnlocksSectionProps> = ({ unlocks }) => {
  if (unlocks.length === 0) {
    return null;
  }
  return (
    <View style={styles.unlocksSection}>
      <Text style={styles.unlocksLabel}>NEW UNLOCKS</Text>
      {unlocks.map((unlock, index) => (
        <View key={`unlock-${unlock}`} style={styles.unlockItem}>
          <Text style={styles.unlockIcon}>→</Text>
          <Text style={styles.unlockText}>{unlock}</Text>
        </View>
      ))}
    </View>
  );
};
