/**
 * Reward Chest - Premium Visual Component
 * Animated chest opening with reward reveal and celebration effects
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { createSheet } from '@/shared/ui/create-sheet';

interface RewardItem {
  id: string;
  type: 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'SHIELD' | 'TITLE' | 'COSMETIC';
  amount: number;
  itemName?: string;
  itemIcon?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

interface RewardChestProps {
  isVisible: boolean;
  rewards: RewardItem[];
  onClaim: () => void;
  onClose: () => void;
  chestType?: 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';
  reason?: string;
}

const { width, height } = Dimensions.get('window');

export const RewardChest: React.FC<RewardChestProps> = ({ isVisible, rewards, onClaim, onClose, chestType = 'WOOD', reason = 'Session Complete!' }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chestAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Reset states
      setIsOpening(false);
      setIsOpen(false);
      chestAnim.value = 0;
      glowAnim.value = 0;

      glowAnim.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, true);
    }
  }, [isVisible, glowAnim, chestAnim]);

  const handleOpen = () => {
    if (isOpening || isOpen) {
      return;
    }

    setIsOpening(true);

    chestAnim.value = withSequence(withTiming(1, { duration: 100 }), withTiming(-1, { duration: 100 }), withTiming(1, { duration: 100 }), withTiming(0, { duration: 100 }));
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 420);
  };

  const getChestStyle = () => {
    switch (chestType) {
      case 'LEGENDARY':
        return { colors: ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'], emoji: '👑', borderColor: 'theme.colors.error.DEFAULT' };
      case 'GOLD':
        return { colors: ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'], emoji: '🏆', borderColor: 'theme.colors.error.DEFAULT' };
      case 'SILVER':
        return { colors: ['theme.colors.primary[500]', 'theme.colors.primary[500]'], emoji: '🥈', borderColor: 'theme.colors.primary[500]' };
      default:
        return { colors: ['theme.colors.primary[500]', 'theme.colors.primary[500]'], emoji: '📦', borderColor: 'theme.colors.primary[500]' };
    }
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return { color: 'theme.colors.error.DEFAULT', glow: 'theme.colors.error.DEFAULT', border: 'theme.colors.error.DEFAULT' };
      case 'EPIC':
        return { color: 'theme.colors.primary[500]', glow: 'theme.colors.primary[500]', border: 'theme.colors.primary[500]' };
      case 'RARE':
        return { color: 'theme.colors.primary[500]', glow: 'theme.colors.primary[500]', border: 'theme.colors.primary[500]' };
      default:
        return { color: 'theme.colors.primary[500]', glow: 'theme.colors.primary[500]', border: 'theme.colors.primary[500]' };
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'XP':
        return '⭐';
      case 'COINS':
        return '🪙';
      case 'GEMS':
        return '💎';
      case 'SHIELD':
        return '🛡️';
      case 'TITLE':
        return '🏷️';
      case 'COSMETIC':
        return '👕';
      default:
        return '🎁';
    }
  };

  const chestStyle = getChestStyle();
  const chestAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chestAnim.value * 10}deg` }, { scale: withSpring(isOpen ? 1.1 : 1) }],
  }));
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(26,26,46,0.95)']} style={styles.background}>
          {/* Reason Text */}
          <Text style={styles.reasonText}>{reason}</Text>

          {/* Chest Container */}
          <Animated.View style={[styles.chestContainer, chestAnimatedStyle]}>
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  shadowColor: chestStyle.borderColor,
                },
                glowAnimatedStyle,
              ]}
            />

            {/* Chest */}
            <Pressable onPress={handleOpen} disabled={isOpen || isOpening} style={({ pressed }) => [styles.chest, pressed && { opacity: 0.8 }, { borderColor: chestStyle.borderColor }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
              <LinearGradient colors={chestStyle.colors as [string, string]} style={[styles.chest, isOpen && styles.chestOpen]}>
                <Text style={styles.chestEmoji}>{isOpen ? '✨' : chestStyle.emoji}</Text>

                {!isOpen && (
                  <View style={styles.tapHint}>
                    <Text style={styles.tapText}>TAP TO OPEN</Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Rewards Display */}
          {isOpen && (
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>🎉 REWARDS 🎉</Text>

              <View style={styles.rewardsGrid}>
                {rewards.map((reward, index) => {
                  const rarity = getRarityStyle(reward.rarity);
                  return (
                    <View
                      key={reward.id}
                      style={[
                        styles.rewardCard,
                        {
                          borderColor: rarity.border,
                          shadowColor: rarity.glow,
                        },
                      ]}
                    >
                      <LinearGradient colors={[`${rarity.color}20`, `${rarity.color}10`]} style={styles.rewardGradient}>
                        <Text style={[styles.rewardIcon, { color: rarity.color }]}>{getRewardIcon(reward.type)}</Text>
                        <Text style={[styles.rewardAmount, { color: rarity.color }]}>+{reward.amount.toLocaleString()}</Text>
                        <Text style={styles.rewardType}>{reward.type}</Text>
                        {reward.rarity !== 'COMMON' && (
                          <View style={[styles.rarityBadge, { backgroundColor: rarity.color }]}>
                            <Text style={styles.rarityText}>{reward.rarity}</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>

              {/* Claim Button */}
              <Pressable style={({ pressed }) => [styles.claimButton, pressed && { opacity: 0.8 }]} onPress={onClaim} accessibilityLabel="CLAIM ALL button" accessibilityRole="button" accessibilityHint="Activates this control">
                <LinearGradient colors={['theme.colors.primary[500]', 'theme.colors.primary[500]']} style={styles.claimGradient}>
                  <Text style={styles.claimText}>CLAIM ALL</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = createSheet({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reasonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'theme.colors.background.primary',
    marginBottom: 40,
    textAlign: 'center',
  },
  chestContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  chest: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: 'theme.colors.text.primary',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  chestOpen: {
    transform: [{ scale: 1.1 }],
  },
  chestEmoji: {
    fontSize: 60,
  },
  tapHint: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tapText: {
    color: 'theme.colors.background.primary',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  rewardsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'theme.colors.error.DEFAULT',
    marginBottom: 20,
    textShadowColor: 'theme.colors.error.DEFAULT',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  rewardCard: {
    width: 100,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  rewardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rewardType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  rarityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    color: 'theme.colors.background.primary',
    fontSize: 8,
    fontWeight: 'bold',
  },
  claimButton: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  claimText: {
    color: 'theme.colors.background.primary',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export * from "./reward-chest.types";
