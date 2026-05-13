/**
 * Level Up Overlay - Premium Visual Component
 * Full-screen celebration for level up with confetti, animations, and reward reveal
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { createSheet } from '@/shared/ui/create-sheet';
import { levelUp } from '../../../utils/haptics';

interface LevelUpOverlayProps {
  isVisible: boolean;
  previousLevel: number;
  newLevel: number;
  rewards: Array<{
    type: string;
    amount: number;
    itemName?: string;
  }>;
  unlocks: string[];
  onContinue: () => void;
}

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ isVisible, previousLevel, newLevel, rewards, unlocks, onContinue }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const scaleAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger level up haptic
      void levelUp();

      // Generate confetti
      const pieces: ConfettiPiece[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        color: ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT', 'theme.colors.primary[500]', 'theme.colors.primary[500]', 'theme.colors.primary[500]'][Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 10,
      }));
      setConfetti(pieces);
      setShowConfetti(true);

      scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacityAnim.value = withTiming(1, { duration: 300 });
      rotateAnim.value = withTiming(1, { duration: 1000 });

      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      scaleAnim.value = 0;
      opacityAnim.value = 0;
      rotateAnim.value = 0;
    }
  }, [isVisible, scaleAnim, opacityAnim, rotateAnim]);

  const getTierTitle = (level: number): string => {
    if (level >= 100) {
      return '🏆 GRAND MASTER';
    }
    if (level >= 50) {
      return '🌟 MASTER';
    }
    if (level >= 25) {
      return '⭐ EXPERT';
    }
    if (level >= 10) {
      return '💫 ADEPT';
    }
    if (level >= 5) {
      return '✨ APPRENTICE';
    }
    return '🌱 NOVICE';
  };

  const getTierColor = (level: number): [string, string] => {
    if (level >= 100) {
      return ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'];
    }
    if (level >= 50) {
      return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
    }
    if (level >= 25) {
      return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
    }
    if (level >= 10) {
      return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
    }
    return ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'];
  };

  const [startColor, endColor] = getTierColor(newLevel);
  const tierTitle = getTierTitle(newLevel);
  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value * 360}deg` }],
  }));

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.container}>
        {/* Background */}
        <LinearGradient colors={['theme.colors.primary[500]', 'theme.colors.primary[500]', 'theme.colors.primary[500]']} style={styles.background} />

        {/* Confetti */}
        {showConfetti &&
          confetti.map((piece) => (
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
                  transform: [{ rotate: `${piece.rotation}deg` }, { translateY: piece.y + height + 100 }],
                },
              ]}
            />
          ))}

        {/* Main Content */}
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Level Badge */}
          <Animated.View style={[styles.levelBadge, badgeStyle]}>
            <LinearGradient colors={[startColor, endColor]} style={styles.badgeGradient}>
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </LinearGradient>
            <View style={styles.badgeRing} />
          </Animated.View>

          {/* Level Up Text */}
          <Text style={styles.levelUpText}>LEVEL UP!</Text>

          <View style={styles.levelChangeRow}>
            <Text style={styles.previousLevel}>Lv {previousLevel}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.newLevel, { color: startColor }]}>Lv {newLevel}</Text>
          </View>

          {/* Tier Title */}
          <Text style={[styles.tierTitle, { color: startColor }]}>{tierTitle}</Text>

          {/* Rewards Section */}
          {rewards.length > 0 && (
            <View style={styles.rewardsSection}>
              <Text style={styles.rewardsLabel}>REWARDS</Text>
              <View style={styles.rewardsRow}>
                {rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardBadge}>
                    <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.rewardGradient}>
                      <Text style={styles.rewardIcon}>{reward.type === 'XP' ? '⭐' : reward.type === 'COINS' ? '🪙' : reward.type === 'GEMS' ? '💎' : '🎁'}</Text>
                      <Text style={styles.rewardAmount}>+{reward.amount}</Text>
                      <Text style={styles.rewardType}>{reward.type}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Unlocks Section */}
          {unlocks.length > 0 && (
            <View style={styles.unlocksSection}>
              <Text style={styles.unlocksLabel}>NEW UNLOCKS</Text>
              {unlocks.map((unlock, index) => (
                <View key={index} style={styles.unlockItem}>
                  <Text style={styles.unlockIcon}>🔓</Text>
                  <Text style={styles.unlockText}>{unlock}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Continue Button */}
          <Pressable style={({ pressed }) => [styles.continueButton, pressed && { opacity: 0.8 }]} onPress={onContinue} accessibilityLabel="AWESOME! 🎉 button" accessibilityRole="button" accessibilityHint="Activates this control">
            <LinearGradient colors={['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.continueGradient}>
              <Text style={styles.continueText}>AWESOME! 🎉</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
    width: width - 48,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'theme.colors.error.DEFAULT',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  badgeRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'theme.colors.background.primary',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  levelUpText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'theme.colors.error.DEFAULT',
    textShadowColor: 'theme.colors.error.DEFAULT',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 16,
  },
  levelChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previousLevel: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: 24,
    color: 'theme.colors.error.DEFAULT',
    marginHorizontal: 12,
  },
  newLevel: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rewardsSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    letterSpacing: 2,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardBadge: {
    width: 80,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rewardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  rewardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'theme.colors.background.primary',
  },
  rewardType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  unlocksSection: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  unlocksLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 2,
  },
  unlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  unlockIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  unlockText: {
    fontSize: 14,
    color: 'theme.colors.background.primary',
    fontWeight: '500',
  },
  continueButton: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: 'theme.colors.error.DEFAULT',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueText: {
    color: 'theme.colors.background.primary',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export * from "./level-up-overlay.types";
