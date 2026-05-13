/**
 * XP Progress Bar - Premium Visual Component
 * Animated XP bar with level transitions, particle effects, and milestone celebrations
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { createSheet } from '@/shared/ui/create-sheet';

interface XpProgressBarProps {
  currentXp: number;
  threshold: number;
  level: number;
  totalXp: number;
  isAnimating?: boolean;
  xpJustAdded?: number;
  onLevelUp?: () => void;
}

const { width } = Dimensions.get('window');
const BAR_WIDTH = width - 48;
const BAR_HEIGHT = 24;

export const XpProgressBar: React.FC<XpProgressBarProps> = ({ currentXp, threshold, level, totalXp, isAnimating = false, xpJustAdded = 0, onLevelUp }) => {
  const progressAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const progressPercent = Math.min(100, (currentXp / threshold) * 100);
  const progressWidth = (BAR_WIDTH * progressPercent) / 100;

  useEffect(() => {
    progressAnim.value = withSpring(progressWidth, {
      damping: 12,
      stiffness: 100,
    });
  }, [progressAnim, progressWidth]);

  useEffect(() => {
    if (isAnimating && xpJustAdded > 0) {
      pulseAnim.value = withSequence(withTiming(1.1, { duration: 200 }), withTiming(1, { duration: 200 }));

      // Generate particles
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: progressWidth + Math.random() * 40 - 20,
        y: Math.random() * 20 - 10,
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 1000);
    }
  }, [isAnimating, xpJustAdded, progressWidth, pulseAnim]);

  useEffect(() => {
    if (progressPercent >= 100) {
      setShowLevelUp(true);
      onLevelUp?.();
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [progressPercent, onLevelUp]);

  const getTierColor = (lvl: number): [string, string] => {
    if (lvl >= 50) {
      return ['theme.colors.error.DEFAULT', 'theme.colors.error.DEFAULT'];
    } // Gold
    if (lvl >= 25) {
      return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
    } // Silver
    if (lvl >= 10) {
      return ['theme.colors.primary[500]', 'theme.colors.primary[500]'];
    } // Bronze
    return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; // Green
  };

  const [startColor, endColor] = getTierColor(level);
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressAnim.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Level Badge */}
      <View style={styles.levelBadgeContainer}>
        <Svg width={56} height={56}>
          <Circle cx={28} cy={28} r={26} fill="theme.colors.primary[500]" stroke={startColor} strokeWidth={3} />
          <G>
            <SvgText x={28} y={24} textAnchor="middle" fill="theme.colors.background.primary" fontSize={10} fontWeight="600">
              LV
            </SvgText>
            <SvgText x={28} y={42} textAnchor="middle" fill={startColor} fontSize={18} fontWeight="bold">
              {level}
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.barContainer}>
        {/* Background Track */}
        <View style={[styles.track, { width: BAR_WIDTH }]}>
          <LinearGradient colors={['theme.colors.primary[500]', 'theme.colors.primary[500]']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </View>

        {/* Progress Fill */}
        <Animated.View style={[styles.progressFill, progressAnimatedStyle]}>
          <LinearGradient colors={[startColor, endColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />

          {/* Shine Effect */}
          <View style={styles.shine} />

          {/* Glow at the tip */}
          <View style={[styles.tipGlow, { shadowColor: startColor }]} />
        </Animated.View>

        {/* Particles */}
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: BAR_HEIGHT / 2 + particle.y,
                backgroundColor: startColor,
              },
            ]}
          />
        ))}

        {/* XP Text */}
        <View style={styles.xpTextContainer}>
          <Text style={styles.xpText}>
            <Text style={[styles.xpCurrent, { color: startColor }]}>{currentXp}</Text>
            <Text style={styles.xpSeparator}> / </Text>
            <Text style={styles.xpThreshold}>{threshold} XP</Text>
          </Text>
        </View>

        {/* Level Up Badge */}
        {showLevelUp && (
          <Animated.View style={styles.levelUpBadge}>
            <Text style={styles.levelUpText}>LEVEL UP!</Text>
          </Animated.View>
        )}
      </View>

      {/* Total XP Footer */}
      <Text style={styles.totalXp}>Total: {totalXp.toLocaleString()} XP</Text>
    </Animated.View>
  );
};

const styles = createSheet({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  levelBadgeContainer: {
    marginBottom: 12,
  },
  barContainer: {
    position: 'relative',
    height: BAR_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: BAR_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'theme.colors.primary[500]',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: BAR_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tipGlow: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 8,
    height: BAR_HEIGHT + 4,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  xpTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpText: {
    flexDirection: 'row',
    fontSize: 12,
    fontWeight: '700',
  },
  xpCurrent: {
    fontWeight: 'bold',
  },
  xpSeparator: {
    color: 'rgba(255,255,255,0.5)',
  },
  xpThreshold: {
    color: 'rgba(255,255,255,0.6)',
  },
  levelUpBadge: {
    position: 'absolute',
    right: 10,
    top: -30,
    backgroundColor: 'theme.colors.error.DEFAULT',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: 'theme.colors.error.DEFAULT',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  levelUpText: {
    color: 'theme.colors.primary[500]',
    fontWeight: 'bold',
    fontSize: 11,
  },
  totalXp: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});

export * from "./xp-progress-bar.types";
