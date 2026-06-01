import React from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { launchColors } from '@theme/tokens/launch-colors';
import type { ConfettiPiece } from './level-up-types';
import { levelUpStyles as styles } from './level-up-styles';

interface ConfettiFieldProps {
  confetti: ConfettiPiece[];
  showConfetti: boolean;
  screenHeight: number;
}

export const ConfettiField: React.FC<ConfettiFieldProps> = ({
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

export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards }) => {
  if (rewards.length === 0) {
    return null;
  }
  return (
    <View style={styles.rewardsSection}>
      <Text style={styles.rewardsLabel}>REWARDS</Text>
      <View style={styles.rewardsRow}>
        {rewards.map((reward, index) => (
          <View key={index} style={styles.rewardBadge}>
            <LinearGradient
              colors={[
                launchColors.rgb_255_255_255_0_2,
                launchColors.rgb_255_255_255_0_1,
              ]}
              style={styles.rewardGradient}
            >
              <Text style={styles.rewardIcon}>
                {reward.type === 'XP'
                  ? '⭐'
                  : reward.type === 'COINS'
                    ? '🪙'
                    : reward.type === 'GEMS'
                      ? '💎'
                      : '🎁'}
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

export const UnlocksSection: React.FC<UnlocksSectionProps> = ({ unlocks }) => {
  if (unlocks.length === 0) {
    return null;
  }
  return (
    <View style={styles.unlocksSection}>
      <Text style={styles.unlocksLabel}>NEW UNLOCKS</Text>
      {unlocks.map((unlock, index) => (
        <View key={index} style={styles.unlockItem}>
          <Text style={styles.unlockIcon}>🔓</Text>
          <Text style={styles.unlockText}>{unlock}</Text>
        </View>
      ))}
    </View>
  );
};
