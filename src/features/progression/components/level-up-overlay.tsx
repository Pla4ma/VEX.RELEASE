import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { levelUp } from '../../../utils/haptics';
import { launchColors } from '@theme/tokens/launch-colors';
import type { LevelUpOverlayProps, ConfettiPiece } from './level-up-types';
import { getTierTitle, getTierColor } from './level-up-types';
import {
  ConfettiField,
  RewardsSection,
  UnlocksSection,
} from './level-up-subcomponents';
import { levelUpStyles as styles } from './level-up-styles';

const { width, height } = Dimensions.get('window');

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  isVisible,
  previousLevel,
  newLevel,
  rewards,
  unlocks,
  onContinue,
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const scaleAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      void levelUp();
      const pieces: ConfettiPiece[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        color: [
          launchColors.hex_ffd700,
          launchColors.hex_ff6b35,
          launchColors.hex_4caf50,
          launchColors.hex_2196f3,
          launchColors.hex_9c27b0,
        ][Math.floor(Math.random() * 5)]!,
        size: 5 + Math.random() * 10,
      }));
      setConfetti(pieces);
      setShowConfetti(true);
      scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacityAnim.value = withTiming(1, { duration: 300 });
      rotateAnim.value = withTiming(1, { duration: 1000 });
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      scaleAnim.value = 0;
      opacityAnim.value = 0;
      rotateAnim.value = 0;
    }
  }, [isVisible, scaleAnim, opacityAnim, rotateAnim]);

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
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[
            launchColors.hex_1a1a2e,
            launchColors.hex_0f0f1e,
            launchColors.hex_1a1a2e,
          ]}
          style={styles.background}
        />

        <ConfettiField
          confetti={confetti}
          showConfetti={showConfetti}
          screenHeight={height}
        />

        <Animated.View style={[styles.content, contentStyle]}>
          <Animated.View style={[styles.levelBadge, badgeStyle]}>
            <LinearGradient
              colors={[startColor, endColor]}
              style={styles.badgeGradient}
            >
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </LinearGradient>
            <View style={styles.badgeRing} />
          </Animated.View>

          <Text style={styles.levelUpText}>LEVEL UP!</Text>

          <View style={styles.levelChangeRow}>
            <Text style={styles.previousLevel}>Lv {previousLevel}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.newLevel, { color: startColor }]}>
              Lv {newLevel}
            </Text>
          </View>

          <Text style={[styles.tierTitle, { color: startColor }]}>
            {tierTitle}
          </Text>

          <RewardsSection rewards={rewards} />
          <UnlocksSection unlocks={unlocks} />

          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onContinue}
            accessibilityLabel="Dismiss level up celebration"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <LinearGradient
              colors={[launchColors.hex_ffd700, launchColors.hex_ff6b35]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>AWESOME! 🎉</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};
