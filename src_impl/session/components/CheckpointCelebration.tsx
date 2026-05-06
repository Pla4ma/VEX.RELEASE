/**
 * Checkpoint Celebration Component
 *
 * Mini-celebration animations at session progress milestones.
 * Confetti, particle effects, and encouraging messages.
 * Triggers at 25%, 50%, 75% completion and every 10 minutes.
 *
 * @priority high
 * @adhd-target micro-rewards keep engagement high during long sessions
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components';

// ============================================================================
// Types
// ============================================================================

interface CheckpointCelebrationProps {
  progressPercent: number;
  elapsedMinutes: number;
  isVisible: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

// ============================================================================
// Checkpoint Messages
// ============================================================================

const PROGRESS_MESSAGES: Record<number, { title: string; subtitle: string; emoji: string }> = {
  25: { title: '25% Complete!', subtitle: 'Great start! Keep going!', emoji: '🌟' },
  50: { title: 'Halfway There!', subtitle: 'You\'re doing amazing!', emoji: '🔥' },
  75: { title: '75% Done!', subtitle: 'Almost there! Push through!', emoji: '⚡' },
  90: { title: 'Almost Done!', subtitle: 'Final stretch! You got this!', emoji: '🏆' },
};

const MINUTE_MESSAGES: Record<number, { title: string; subtitle: string; emoji: string }> = {
  10: { title: '10 Minutes!', subtitle: 'Focus power building!', emoji: '💪' },
  20: { title: '20 Minutes!', subtitle: 'Deep focus zone!', emoji: '🧠' },
  30: { title: '30 Minutes!', subtitle: 'Half hour of pure focus!', emoji: '👑' },
  45: { title: '45 Minutes!', subtitle: 'Legendary concentration!', emoji: '💎' },
  60: { title: '1 Hour!', subtitle: 'You are unstoppable!', emoji: '🚀' },
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateParticles(count: number): Particle[] {
  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 300 - 150,
    y: Math.random() * -200 - 50,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 5,
    delay: Math.random() * 500,
  }));
}

// ============================================================================
// Component
// ============================================================================

export function CheckpointCelebration({
  progressPercent,
  elapsedMinutes,
  isVisible,
  onComplete,
}: CheckpointCelebrationProps): JSX.Element | null {
  const { theme } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'progress' | 'minute';
    value: number;
    title: string;
    subtitle: string;
    emoji: string;
  } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const particleY = useSharedValue(0);

  // Check for checkpoints
  useEffect(() => {
    if (!isVisible) {return;}

    const progressCheckpoints = [25, 50, 75, 90];
    const minuteCheckpoints = [10, 20, 30, 45, 60];

    // Check progress checkpoints
    for (const checkpoint of progressCheckpoints) {
      if (progressPercent >= checkpoint && lastCheckpoint < checkpoint) {
        const message = PROGRESS_MESSAGES[checkpoint];
        if (message) {
          setCelebrationData({
            type: 'progress',
            value: checkpoint,
            ...message,
          });
          setShowCelebration(true);
          setLastCheckpoint(checkpoint);
          setParticles(generateParticles(20));
          return;
        }
      }
    }

    // Check minute checkpoints
    for (const checkpoint of minuteCheckpoints) {
      if (elapsedMinutes === checkpoint && lastCheckpoint < checkpoint + 100) {
        const message = MINUTE_MESSAGES[checkpoint];
        if (message) {
          setCelebrationData({
            type: 'minute',
            value: checkpoint,
            ...message,
          });
          setShowCelebration(true);
          setLastCheckpoint(checkpoint + 100);
          setParticles(generateParticles(20));
          return;
        }
      }
    }
  }, [progressPercent, elapsedMinutes, isVisible, lastCheckpoint]);

  // Animate celebration
  useEffect(() => {
    if (showCelebration) {
      // Reset animations
      scale.value = 0;
      opacity.value = 0;
      emojiScale.value = 0;
      particleY.value = 0;

      // Start entrance animation
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      emojiScale.value = withSequence(
        withTiming(1.5, { duration: 300, easing: Easing.out(Easing.back(2)) }),
        withSpring(1, { damping: 10 })
      );

      // Particle animation
      particleY.value = withTiming(-300, { duration: 1500 });

      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowCelebration)(false);
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showCelebration, scale, opacity, emojiScale, particleY, onComplete]);

  // Animation styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  if (!showCelebration || !celebrationData) {return null;}

  return (
    <Animated.View style={[overlayStyle, containerStyle]}>
      {/* Particle Effects */}
      <View style={particleContainerStyle}>
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              particleStyle,
              {
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                ],
              },
              particleStyle,
            ]}
          />
        ))}
      </View>

      {/* Main Celebration Card */}
      <Animated.View style={[cardStyle, { backgroundColor: theme.colors.background.elevated }]}>
        {/* Emoji */}
        <View style={emojiContainerStyle}>
          <Animated.View style={[emojiContainerStyle, emojiStyle]}>
            <Text style={emojiTextStyle}>{celebrationData.emoji}</Text>
          </Animated.View>
        </View>

        {/* Title */}
        <Text variant="h3" style={titleStyle}>{celebrationData.title}</Text>

        {/* Subtitle */}
        <Text variant="body" color="secondary" style={subtitleStyle}>{celebrationData.subtitle}</Text>

        {/* Bonus indicator */}
        {celebrationData.type === 'minute' && (
          <View style={bonusBadgeStyle}>
            <Text style={bonusTextStyle}>+50 XP Bonus!</Text>
          </View>
        )}

        {/* Progress indicator */}
        {celebrationData.type === 'progress' && (
          <View style={progressContainerStyle}>
            <View style={[progressBarStyle, { width: `${celebrationData.value}%`, backgroundColor: theme.colors.primary[500] }]} />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  };

  const particleContainerStyle = {
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    width: 1,
    height: 1,
  };

  const particleStyle = {
    position: 'absolute' as const,
    borderRadius: 50,
  };

  const cardStyle = {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  };

  const emojiContainerStyle = { marginBottom: 16 };

  const emojiTextStyle = { fontSize: 64 };

  const titleStyle = { marginBottom: 8, textAlign: 'center' as const };

  const subtitleStyle = { textAlign: 'center' as const, marginBottom: 16 };

  const bonusBadgeStyle = {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  };

  const bonusTextStyle = {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 14,
  };

  const progressContainerStyle = {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden' as const,
  };

  const progressBarStyle = {
    height: '100%' as const,
    borderRadius: 4,
  };

export default CheckpointCelebration;
