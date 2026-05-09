/**
 * StreakGamblePrompt
 *
 * Risk/reward mechanic for streak protection.
 * When streak is at CRITICAL risk (< 3 hours left), users can:
 * 1. Use Streak Shield (guaranteed save)
 * 2. GAMBLE: Start a session, if they score S or A, streak saves WITHOUT using shield
 *
 * Psychology: Creates skill-based tension and strategic depth.
 * Players feel agency - their skill can save them, not just items.
 */

import React, { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, FadeIn, FadeInUp, runOnJS } from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import * as Sentry from '@sentry/react-native';
import { getAnalyticsService } from '@/analytics/AnalyticsService';

// ============================================================================
// Types
// ============================================================================

interface StreakGamblePromptProps {
  /** Current streak days */
  streakDays: number;
  /** Hours remaining until streak breaks */
  hoursRemaining: number;
  /** Number of shields available */
  shieldsAvailable: number;
  /** User's current level (for XP calculation) */
  userLevel: number;
  /** Called when user chooses guaranteed shield option */
  onUseShield: () => void;
  /** Called when user chooses to gamble - starts session */
  onGamble: () => void;
  /** Called when user dismisses/declines both options */
  onDismiss: () => void;
  /** Called after session completes with grade - determines if gamble succeeded */
  onSessionComplete?: (grade: 'S' | 'A' | 'B' | 'C' | 'D') => void;
}

type GambleState = 'prompt' | 'gambling' | 'won' | 'lost';

interface GambleOutcome {
  success: boolean;
  grade: string;
  xpEarned: number;
  shieldPreserved: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const CRITICAL_HOURS_THRESHOLD = 3; // Show prompt when < 3 hours
const GAMBLE_SUCCESS_GRADES = ['S', 'A']; // Must score S or A to win
const GAMBLE_BONUS_XP = 50; // Bonus XP for winning the gamble

// ============================================================================
// Component
// ============================================================================

export const StreakGamblePrompt: React.FC<StreakGamblePromptProps> = ({ streakDays, hoursRemaining, shieldsAvailable, userLevel, onUseShield, onGamble, onDismiss, onSessionComplete }) => {
  const { theme } = useTheme();
  const [gambleState, setGambleState] = useState<GambleState>('prompt');
  const [outcome, setOutcome] = useState<GambleOutcome | null>(null);
  const [selectedOption, setSelectedOption] = useState<'shield' | 'gamble' | null>(null);

  // Animation values
  const pulseOpacity = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const countdownScale = useSharedValue(1);

  useEffect(() => {
    // Pulsing urgency animation
    pulseOpacity.value = withRepeat(withSequence(withTiming(0.6, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true);

    // Subtle shake for urgency
    shakeX.value = withRepeat(withSequence(withTiming(-2, { duration: 100 }), withTiming(2, { duration: 100 }), withTiming(0, { duration: 100 })), -1, true);

    // Countdown scale pulse
    countdownScale.value = withRepeat(withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);

    // Track analytics
    Sentry.addBreadcrumb({
      category: 'streaks',
      message: 'Streak gamble prompt shown',
      level: 'warning',
      data: {
        streakDays,
        hoursRemaining,
        shieldsAvailable,
      },
    });
  }, []);

  // Handle user selecting shield option
  const handleUseShield = () => {
    setSelectedOption('shield');

    // Glow animation
    glowScale.value = withSpring(1.2, { damping: 10 }, () => {
      glowScale.value = withTiming(1, { duration: 200 });
      runOnJS(onUseShield)();
    });
  };

  // Handle user selecting gamble option
  const handleGamble = () => {
    setSelectedOption('gamble');
    setGambleState('gambling');
    onGamble();
  };

  // Handle session completion (called externally)
  const handleSessionComplete = (grade: 'S' | 'A' | 'B' | 'C' | 'D') => {
    const success = GAMBLE_SUCCESS_GRADES.includes(grade);

    const outcome: GambleOutcome = {
      success,
      grade,
      xpEarned: success ? GAMBLE_BONUS_XP + userLevel * 2 : 0,
      shieldPreserved: success, // Shield only used if gamble failed
    };

    setOutcome(outcome);
    setGambleState(success ? 'won' : 'lost');

    // Track outcome
    Sentry.addBreadcrumb({
      category: 'streaks',
      message: `Streak gamble ${success ? 'WON' : 'LOST'}`,
      level: success ? 'info' : 'warning',
      data: {
        grade,
        streakDays,
        xpEarned: outcome.xpEarned,
      },
    });

    onSessionComplete?.(grade);
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const countdownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));

  // Format time remaining
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.ceil(hours * 60)} minutes`;
    }
    return `${Math.ceil(hours * 10) / 10} hours`;
  };

  // Calculate risk level text
  const getRiskText = (hours: number): { text: string; color: string } => {
    if (hours < 1) {
      return { text: 'CRITICAL - About to break!', color: theme.colors.error.DEFAULT };
    }
    if (hours < 2) {
      return { text: 'HIGH RISK', color: theme.colors.error.DEFAULT };
    }
    return { text: 'AT RISK', color: theme.colors.warning.DEFAULT };
  };

  const riskInfo = getRiskText(hoursRemaining);

  // RENDER: Prompt state
  if (gambleState === 'prompt') {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <Box
          p={5}
          borderRadius={20}
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 3,
            borderColor: theme.colors.error.DEFAULT,
            shadowColor: theme.colors.error.DEFAULT,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header: Critical warning */}
          <Box alignItems="center" mb={4}>
            <Animated.View style={[shakeStyle]}>
              <Text
                variant="h2"
                color={riskInfo.color}
                style={{
                  textShadowColor: riskInfo.color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 15,
                }}
              >
                🔥 STREAK AT RISK!
              </Text>
            </Animated.View>

            <Box flexDirection="row" alignItems="baseline" gap={1} mt={2}>
              <Animated.View style={countdownStyle}>
                <Text variant="hero" color={theme.colors.error.DEFAULT}>
                  {Math.ceil(hoursRemaining * 10) / 10}h
                </Text>
              </Animated.View>
              <Text variant="body" color={theme.colors.text.secondary}>
                until your {streakDays}-day streak breaks
              </Text>
            </Box>

            <Text variant="caption" color={theme.colors.error.DEFAULT} mt={1}>
              {riskInfo.text}
            </Text>
          </Box>

          {/* Streak visualization */}
          <Box flexDirection="row" alignItems="center" justifyContent="center" mb={5} p={4} borderRadius={16} bg={theme.colors.background.primary}>
            <Text style={{ fontSize: 32 }}>🔥</Text>
            <Box ml={3}>
              <Text variant="h3" color={theme.colors.text.primary}>
                {streakDays} Day Streak
              </Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                Don't lose your progress!
              </Text>
            </Box>
          </Box>

          {/* Two options */}
          <Box gap={3}>
            {/* Option 1: Guaranteed Shield */}
            <Animated.View style={glowStyle}>
              <Button variant="primary" size="lg" fullWidth onPress={handleUseShield} disabled={shieldsAvailable === 0} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
                <Box flexDirection="row" alignItems="center" gap={2}>
                  <Text style={{ fontSize: 20 }}>🛡️</Text>
                  <Box alignItems="flex-start">
                    <Text color={theme.colors.text.inverse} fontWeight="bold">
                      Use Streak Shield
                    </Text>
                    <Text color={theme.colors.text.inverse} variant="caption" opacity={0.8}>
                      {shieldsAvailable > 0 ? `Save streak guaranteed (${shieldsAvailable} available)` : 'No shields available'}
                    </Text>
                  </Box>
                </Box>
              </Button>
            </Animated.View>

            {/* Divider with "OR" */}
            <Box flexDirection="row" alignItems="center" gap={3} my={2}>
              <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
              <Text variant="caption" color={theme.colors.text.tertiary}>
                OR GAMBLE
              </Text>
              <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
            </Box>

            {/* Option 2: The Gamble */}
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={handleGamble}
              style={{
                borderColor: theme.colors.warning.DEFAULT,
                borderWidth: 2,
              }}
              accessibilityLabel="🎲 Take the Risk Start a session NOW - Score S or A to save streak button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Box flexDirection="row" alignItems="center" gap={2}>
                <Text style={{ fontSize: 20 }}>🎲</Text>
                <Box alignItems="flex-start">
                  <Text color={theme.colors.warning.DEFAULT} fontWeight="bold">
                    Take the Risk
                  </Text>
                  <Text color={theme.colors.text.secondary} variant="caption">
                    Start a session NOW - Score S or A to save streak
                  </Text>
                </Box>
              </Box>
            </Button>

            {/* Gamble details */}
            <Animated.View style={[pulseStyle]}>
              <Box
                p={3}
                borderRadius={12}
                style={{
                  backgroundColor: `${theme.colors.warning.DEFAULT}15`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.warning.DEFAULT}30`,
                }}
              >
                <Text variant="caption" color={theme.colors.warning.DEFAULT} textAlign="center">
                  ⚡ If you score S or A: Streak saved + {GAMBLE_BONUS_XP} bonus XP!{'\n'}
                  If below A: Streak breaks, no shield used
                </Text>
              </Box>
            </Animated.View>
          </Box>

          {/* Dismiss option */}
          <Box mt={4} alignItems="center">
            <Button variant="ghost" size="sm" onPress={onDismiss} accessibilityLabel="I'll risk it (don't remind me) button" accessibilityRole="button" accessibilityHint="Activates this control">
              <Text color={theme.colors.text.tertiary}>I'll risk it (don't remind me)</Text>
            </Button>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  // RENDER: Gambling state (session in progress)
  if (gambleState === 'gambling') {
    return (
      <Animated.View entering={FadeIn}>
        <Box
          p={5}
          borderRadius={20}
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 2,
            borderColor: theme.colors.warning.DEFAULT,
          }}
        >
          <Box alignItems="center">
            <Text style={{ fontSize: 48 }}>🎲</Text>
            <Text variant="h2" color={theme.colors.warning.DEFAULT} mt={3}>
              Gamble in Progress!
            </Text>
            <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mt={2}>
              Focus and give it your best shot!{'\n'}
              Score S or A to save your {streakDays}-day streak.
            </Text>

            <Box mt={4} p={3} borderRadius={12} bg={theme.colors.background.primary}>
              <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center">
                Session active - maintain focus for best grade
              </Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  // RENDER: Won state
  if (gambleState === 'won' && outcome) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <Box
          p={5}
          borderRadius={20}
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 3,
            borderColor: theme.colors.success.DEFAULT,
          }}
        >
          <Box alignItems="center">
            <Text style={{ fontSize: 56 }}>🏆</Text>
            <Text variant="h1" color={theme.colors.success.DEFAULT} mt={2}>
              GAMBLE WON!
            </Text>
            <Text variant="h3" color={theme.colors.text.primary} mt={1}>
              Grade {outcome.grade} - Streak Saved!
            </Text>

            <Box mt={4} alignItems="center">
              <Text variant="body" color={theme.colors.text.secondary}>
                Your skill saved the day!
              </Text>
              <Box flexDirection="row" alignItems="center" gap={2} mt={2}>
                <Text style={{ fontSize: 24 }}>⭐</Text>
                <Text variant="h3" color={theme.colors.warning.DEFAULT}>
                  +{outcome.xpEarned} Bonus XP
                </Text>
              </Box>
              {outcome.shieldPreserved && (
                <Text variant="bodySmall" color={theme.colors.success.DEFAULT} mt={1}>
                  🛡️ Shield preserved for future use
                </Text>
              )}
            </Box>

            <Box mt={5}>
              <Button variant="primary" size="md" onPress={onDismiss} accessibilityLabel="Continue button" accessibilityRole="button" accessibilityHint="Activates this control">
                Continue
              </Button>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  // RENDER: Lost state
  if (gambleState === 'lost' && outcome) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <Box
          p={5}
          borderRadius={20}
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 2,
            borderColor: theme.colors.error.DEFAULT,
          }}
        >
          <Box alignItems="center">
            <Text style={{ fontSize: 48 }}>💔</Text>
            <Text variant="h2" color={theme.colors.error.DEFAULT} mt={2}>
              Gamble Failed
            </Text>
            <Text variant="h4" color={theme.colors.text.secondary} mt={1}>
              Grade {outcome.grade} - Streak Broken
            </Text>

            <Box mt={4} p={4} borderRadius={12} bg={theme.colors.background.primary}>
              <Text variant="body" color={theme.colors.text.secondary} textAlign="center">
                You gave it your best shot!{'\n'}
                Your {streakDays}-day streak will reset.
              </Text>
            </Box>

            <Box mt={3}>
              <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center">
                🛡️ Good news: Your shield wasn't used
              </Text>
            </Box>

            <Box mt={5}>
              <Button variant="primary" size="md" onPress={onDismiss} accessibilityLabel="Start Fresh button" accessibilityRole="button" accessibilityHint="Activates this control">
                Start Fresh
              </Button>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  return null;
};

// ============================================================================
// Analytics
// ============================================================================

/**
 * Track streak gamble decision
 */
export function trackStreakGambleDecision(userId: string, decision: 'shield' | 'gamble' | 'dismiss', streakDays: number, hoursRemaining: number): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak gamble decision: ${decision}`,
    level: 'info',
    data: {
      userId,
      decision,
      streakDays,
      hoursRemaining,
    },
  });

  getAnalyticsService().track('streak_gamble_decision', {
    user_id: userId,
    decision,
    streak_days: streakDays,
    hours_remaining: hoursRemaining,
  });
}

// ============================================================================
// Hook for determining if gamble prompt should show
// ============================================================================

/**
 * Hook to determine if streak gamble prompt should be shown
 */
export function useShouldShowGamblePrompt(hoursRemaining: number, shieldsAvailable: number, hasPromptedToday: boolean): boolean {
  // Show if:
  // 1. Less than critical hours remaining
  // 2. Has shields OR hasn't been dismissed
  // 3. Hasn't been prompted today
  return hoursRemaining < CRITICAL_HOURS_THRESHOLD && (shieldsAvailable > 0 || !hasPromptedToday) && !hasPromptedToday;
}

// ============================================================================
// Export
// ============================================================================

export default StreakGamblePrompt;
export { CRITICAL_HOURS_THRESHOLD, GAMBLE_SUCCESS_GRADES, GAMBLE_BONUS_XP };
