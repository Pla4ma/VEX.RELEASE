/**
 * Combo Meter Component
 *
 * Mid-session dopamine engine for ADHD users.
 * Shows consecutive focused minutes with escalating rewards.
 * Visual momentum that makes users want to keep going.
 *
 * Features:
 * - Combo bar that fills with each consecutive focused minute
 * - Milestone celebrations at 5, 10, 15, 20+ minutes
 * - Multiplier display (2x, 3x, 5x XP)
 * - Fire animation that intensifies with combo
 * - Warning when combo about to break (pause/idle detected)
 *
 * @priority high
 * @adhd-target visual momentum and milestone celebrations
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  runOnJS,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const METER_WIDTH = SCREEN_WIDTH - 48;

// ============================================================================
// Types
// ============================================================================

interface ComboMeterProps {
  comboMinutes: number;
  isPaused: boolean;
  isIdle: boolean;
  onMilestoneReached?: (milestone: number, multiplier: number) => void;
  onComboBroken?: (finalCombo: number) => void;
}

type ComboTier = 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface ComboTierConfig {
  minCombo: number;
  name: string;
  color: string;
  emoji: string;
  multiplier: number;
  animation: 'pulse' | 'shake' | 'rainbow';
}

// ============================================================================
// Combo Tier Configuration
// ============================================================================

const COMBO_TIERS: ComboTierConfig[] = [
  { minCombo: 0, name: 'Focus', color: '#6B7280', emoji: '⚪', multiplier: 1, animation: 'pulse' },
  { minCombo: 5, name: 'Bronze', color: '#B45309', emoji: '🥉', multiplier: 1.5, animation: 'pulse' },
  { minCombo: 10, name: 'Silver', color: '#9CA3AF', emoji: '🥈', multiplier: 2, animation: 'shake' },
  { minCombo: 15, name: 'Gold', color: '#FBBF24', emoji: '🥇', multiplier: 3, animation: 'shake' },
  { minCombo: 20, name: 'Platinum', color: '#A855F7', emoji: '💜', multiplier: 4, animation: 'rainbow' },
  { minCombo: 30, name: 'Diamond', color: '#3B82F6', emoji: '💎', multiplier: 5, animation: 'rainbow' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getCurrentTier(combo: number): ComboTierConfig {
  for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_TIERS[i].minCombo) {
      return COMBO_TIERS[i];
    }
  }
  return COMBO_TIERS[0];
}

function getTierProgress(combo: number): number {
  const currentTier = getCurrentTier(combo);
  const nextTier = COMBO_TIERS.find(t => t.minCombo > combo);

  if (!nextTier) {return 1;} // Max tier

  const tierRange = nextTier.minCombo - currentTier.minCombo;
  const progress = combo - currentTier.minCombo;
  return progress / tierRange;
}

function getMilestoneMessage(milestone: number): string {
  const messages: Record<number, string> = {
    5: "5 minutes! You're warming up! 🔥",
    10: '10 minutes! Keep that momentum! 💪',
    15: "15 minutes! You're in the zone! ⚡",
    20: '20 minutes! Unstoppable! 🚀',
    25: '25 minutes! Legendary focus! 👑',
    30: '30 minutes! DIAMOND STATUS! 💎',
    45: "45 minutes! You're a machine! 🤖",
    60: '60 MINUTES! ABSOLUTE LEGEND! 🏆',
  };
  return messages[milestone] || `${milestone} minutes! Amazing! 🎉`;
}

// ============================================================================
// Component
// ============================================================================

export function ComboMeter({
  comboMinutes,
  isPaused,
  isIdle,
  onMilestoneReached,
  onComboBroken,
}: ComboMeterProps): JSX.Element {
  const { theme } = useTheme();
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState('');
  const [lastMilestone, setLastMilestone] = useState(0);
  const [showComboBroken, setShowComboBroken] = useState(false);
  const previousComboRef = useRef(comboMinutes);
  const wasPausedRef = useRef(isPaused);

  const tier = getCurrentTier(comboMinutes);
  const tierProgress = getTierProgress(comboMinutes);
  const nextTier = COMBO_TIERS.find(t => t.minCombo > comboMinutes);

  // Animation values
  const progressWidth = useSharedValue(0);
  const glowIntensity = useSharedValue(0.5);
  const scale = useSharedValue(1);
  const fireIntensity = useSharedValue(0);
  const shakeRotation = useSharedValue(0);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimation(progressWidth);
      cancelAnimation(glowIntensity);
      cancelAnimation(scale);
      cancelAnimation(fireIntensity);
      cancelAnimation(shakeRotation);
    };
  }, [fireIntensity, glowIntensity, progressWidth, scale, shakeRotation]);

  // Handle milestone detection
  useEffect(() => {
    const milestones = [5, 10, 15, 20, 25, 30, 45, 60];

    for (const milestone of milestones) {
      if (comboMinutes === milestone && milestone > lastMilestone) {
        setLastMilestone(milestone);
        setMilestoneMessage(getMilestoneMessage(milestone));
        setShowMilestone(true);

        // Celebration animation
        scale.value = withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 })
        );

        onMilestoneReached?.(milestone, tier.multiplier);

        // Hide milestone after 3 seconds
        setTimeout(() => {
          setShowMilestone(false);
        }, 3000);

        break;
      }
    }
  }, [comboMinutes, lastMilestone, tier.multiplier, onMilestoneReached, scale]);

  // Handle combo broken
  useEffect(() => {
    if ((isPaused || isIdle) && previousComboRef.current > 0 && !wasPausedRef.current) {
      // Combo is breaking
      if (previousComboRef.current >= 5) {
        setShowComboBroken(true);
        onComboBroken?.(previousComboRef.current);

        setTimeout(() => {
          setShowComboBroken(false);
        }, 2000);
      }
    }

    previousComboRef.current = comboMinutes;
    wasPausedRef.current = isPaused || isIdle;
  }, [isPaused, isIdle, comboMinutes, onComboBroken]);

  // Update progress animation
  useEffect(() => {
    progressWidth.value = withTiming(tierProgress, { duration: 500 });
  }, [tierProgress, progressWidth]);

  // Fire animation based on tier
  useEffect(() => {
    if (comboMinutes >= 10 && !isPaused && !isIdle) {
      fireIntensity.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      fireIntensity.value = withTiming(0, { duration: 300 });
    }
  }, [comboMinutes, isPaused, isIdle, fireIntensity]);

  // Shake animation for high tiers
  useEffect(() => {
    if (comboMinutes >= 15 && !isPaused && !isIdle) {
      shakeRotation.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 50 }),
          withTiming(1, { duration: 50 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(shakeRotation);
      shakeRotation.value = 0;
    }
  }, [comboMinutes, isPaused, isIdle, shakeRotation]);

  // Animation styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    backgroundColor: tier.color,
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0.5, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowIntensity.value, [0.5, 1], [1, 1.1]) }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${shakeRotation.value}deg` },
    ],
  }));

  const fireStyle = useAnimatedStyle(() => ({
    opacity: fireIntensity.value,
  }));

  // Format combo time
  const formatCombo = (minutes: number): string => {
    if (minutes < 60) {return `${minutes}m`;}
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Animated.View style={[containerStyle, animatedContainerStyle]}>
      {/* Background Glow */}
      <Animated.View
        style={[
          glowStyle,
          glowAnimStyle,
          { backgroundColor: tier.color },
        ]}
      />

      {/* Fire Effect */}
      {comboMinutes >= 10 && (
        <Animated.View style={[fireContainerStyle, fireStyle]}>
          <Text style={fireEmojiStyle}>🔥</Text>
          {comboMinutes >= 20 && <Text style={fireEmojiStyle}>🔥</Text>}
          {comboMinutes >= 30 && <Text style={fireEmojiStyle}>🔥</Text>}
        </Animated.View>
      )}

      {/* Main Container */}
      <View style={[mainContainerStyle, { backgroundColor: theme.colors.background.elevated }]}>
        {/* Header Row */}
        <View style={headerRowStyle}>
          <View style={tierBadgeStyle}>
            <Text style={[tierEmojiStyle, { color: tier.color }]}>
              {tier.emoji}
            </Text>
          </View>

          <View style={comboInfoStyle}>
            <Text variant="h4" style={comboTextStyle}>
              {formatCombo(comboMinutes)} Combo
            </Text>
            <Text variant="caption" color="secondary">
              {tier.multiplier}x XP • {tier.name} Tier
            </Text>
          </View>

          <View style={[multiplierBadgeStyle, { backgroundColor: tier.color }]}>
            <Text style={multiplierTextStyle}>{tier.multiplier}x</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[progressContainerStyle, { backgroundColor: theme.colors.background.secondary }]}>
          <Animated.View style={[progressBarStyle, progressStyle]} />
        </View>

        {/* Next Tier Info */}
        {nextTier && (
          <Text variant="caption" color="secondary" style={nextTierTextStyle}>
            {nextTier.minCombo - comboMinutes} min to {nextTier.emoji} {nextTier.name} ({nextTier.multiplier}x)
          </Text>
        )}

        {/* Max Tier Message */}
        {!nextTier && comboMinutes >= 30 && (
          <Text variant="caption" style={[maxTierTextStyle, { color: tier.color }]}>
            💎 DIAMOND TIER MAXED! Keep going! 💎
          </Text>
        )}
      </View>

      {/* Milestone Celebration */}
      {showMilestone && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={milestoneOverlayStyle}
        >
          <View style={[milestoneCardStyle, { backgroundColor: theme.colors.background.elevated }]}>
            <Text style={milestoneEmojiStyle}>🎉</Text>
            <Text variant="h3" style={milestoneTextStyle}>
              {milestoneMessage}
            </Text>
            <Text variant="caption" color="secondary">
              {tier.multiplier}x XP Multiplier Active!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Combo Broken Warning */}
      {showComboBroken && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={comboBrokenOverlayStyle}
        >
          <View style={[comboBrokenCardStyle, { backgroundColor: theme.colors.error.DEFAULT }]}>
            <Text style={comboBrokenEmojiStyle}>💔</Text>
            <Text variant="h4" style={comboBrokenTextStyle}>
              Combo Broken!
            </Text>
            <Text variant="caption" style={comboBrokenSubtextStyle}>
              You had a {previousComboRef.current} minute streak
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Paused/Idle Warning */}
      {(isPaused || isIdle) && comboMinutes > 0 && (
        <View style={[warningOverlayStyle, { backgroundColor: theme.colors.warning.DEFAULT + '20' }]}>
          <Text variant="caption" color="warning" style={warningTextStyle}>
            {isPaused ? '⏸️ PAUSED - Combo at risk!' : '⚠️ IDLE - Move to keep combo!'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const containerStyle = { width: METER_WIDTH, alignSelf: 'center' as const, marginVertical: 12 };
const glowStyle = { position: 'absolute' as const, top: -10, left: -10, right: -10, bottom: -10, borderRadius: 20, opacity: 0.3 };
const fireContainerStyle = { position: 'absolute' as const, top: -30, right: 10, flexDirection: 'row' as const, zIndex: 1 };
const fireEmojiStyle = { fontSize: 24, marginLeft: -8 };
const mainContainerStyle = {
  borderRadius: 16,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};
const headerRowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 12 };
const tierBadgeStyle = { width: 44, height: 44, borderRadius: 22, justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 12 };
const tierEmojiStyle = { fontSize: 24 };
const comboInfoStyle = { flex: 1 };
const comboTextStyle = { fontWeight: '700' as const };
const multiplierBadgeStyle = { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 };
const multiplierTextStyle = { color: '#fff', fontWeight: '700' as const, fontSize: 14 };
const progressContainerStyle = { height: 12, borderRadius: 6, overflow: 'hidden' as const, marginBottom: 8 };
const progressBarStyle = { height: '100%' as const, borderRadius: 6 };
const nextTierTextStyle = { textAlign: 'center' as const };
const maxTierTextStyle = { textAlign: 'center' as const, fontWeight: '700' as const };
const milestoneOverlayStyle = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' as const, alignItems: 'center' as const, zIndex: 10 };
const milestoneCardStyle = { padding: 24, borderRadius: 20, alignItems: 'center' as const, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 };
const milestoneEmojiStyle = { fontSize: 48, marginBottom: 12 };
const milestoneTextStyle = { textAlign: 'center' as const, marginBottom: 8 };
const comboBrokenOverlayStyle = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' as const, alignItems: 'center' as const, zIndex: 10 };
const comboBrokenCardStyle = { padding: 20, borderRadius: 16, alignItems: 'center' as const };
const comboBrokenEmojiStyle = { fontSize: 40, marginBottom: 8 };
const comboBrokenTextStyle = { color: '#fff', marginBottom: 4 };
const comboBrokenSubtextStyle = { color: '#fff', opacity: 0.8 };
const warningOverlayStyle = { position: 'absolute' as const, top: -8, left: 0, right: 0, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8 };
const warningTextStyle = { textAlign: 'center' as const, fontWeight: '600' as const };

export default ComboMeter;
