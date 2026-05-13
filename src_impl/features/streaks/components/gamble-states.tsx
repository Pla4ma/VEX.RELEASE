/** StreakGamblePrompt - risk/reward mechanic. Composes prompt, gambling, won, and lost states. */

import React, { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInUp, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import * as Sentry from '@sentry/react-native';
import { GAMBLE_SUCCESS_GRADES, type GambleState, type GambleOutcome, type StreakGamblePromptProps } from './gamble-types';
import { calculateGambleOutcome } from './gamble-logic';
import { usePulseAnimation, useShakeAnimation, useGlowAnimation, useCountdownAnimation } from './gamble-animations';
import { GamblePromptView } from './gamble-prompt-view';

export const StreakGamblePrompt: React.FC<StreakGamblePromptProps> = ({
  streakDays, hoursRemaining, shieldsAvailable, userLevel: _userLevel,
  onUseShield, onGamble, onDismiss, onSessionComplete: _onSessionComplete,
}) => {
  const { theme } = useTheme();
  const [gambleState, setGambleState] = useState<GambleState>('prompt');
  const [outcome, setOutcome] = useState<GambleOutcome | null>(null);
  const pulseStyle = usePulseAnimation();
  const shakeStyle = useShakeAnimation();
  const { glowStyle, glowScale } = useGlowAnimation();
  const countdownStyle = useCountdownAnimation();

  useEffect(() => {
    Sentry.addBreadcrumb({ category: 'streaks', message: 'Streak gamble prompt shown', level: 'warning', data: { streakDays, hoursRemaining, shieldsAvailable } });
  }, [hoursRemaining, shieldsAvailable, streakDays]);

  const handleUseShield = () => {
    glowScale.value = withSpring(1.2, { damping: 10 }, () => {
      glowScale.value = withTiming(1, { duration: 200 });
      runOnJS(onUseShield)();
    });
  };

  const handleGamble = () => { setGambleState('gambling'); onGamble(); };

  const handleSessionComplete = (grade: 'S' | 'A' | 'B' | 'C' | 'D') => {
    const success = GAMBLE_SUCCESS_GRADES.includes(grade);
    const computedOutcome = calculateGambleOutcome(grade, success, _userLevel);
    setOutcome(computedOutcome);
    setGambleState(success ? 'won' : 'lost');
    Sentry.addBreadcrumb({ category: 'streaks', message: `Streak gamble ${success ? 'WON' : 'LOST'}`, level: success ? 'info' : 'warning', data: { grade, streakDays, xpEarned: computedOutcome.xpEarned } });
    _onSessionComplete?.(grade);
  };

  if (gambleState === 'prompt') {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <GamblePromptView streakDays={streakDays} hoursRemaining={hoursRemaining} shieldsAvailable={shieldsAvailable} shakeStyle={shakeStyle} countdownStyle={countdownStyle} glowStyle={glowStyle} pulseStyle={pulseStyle} onUseShield={handleUseShield} onGamble={handleGamble} onDismiss={onDismiss} />
      </Animated.View>
    );
  }

  if (gambleState === 'gambling') {
    return (
      <Animated.View entering={FadeIn}>
        <Box p={5} borderRadius={20} bg={theme.colors.background.secondary} style={{ borderWidth: 2, borderColor: theme.colors.warning.DEFAULT }}>
          <Box alignItems="center">
            <Text style={{ fontSize: 48 }}>{'\uD83C\uDFB2'}</Text>
            <Text variant="h2" color={theme.colors.warning.DEFAULT} mt={3}>Gamble in Progress!</Text>
            <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mt={2}>
              {'Focus and give it your best shot!\nScore S or A to save your '}{streakDays}{'-day streak.'}
            </Text>
            <Box mt={4} p={3} borderRadius={12} bg={theme.colors.background.primary}>
              <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center">Session active - maintain focus for best grade</Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  if (gambleState === 'won' && outcome) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <Box p={5} borderRadius={20} bg={theme.colors.background.secondary} style={{ borderWidth: 3, borderColor: theme.colors.success.DEFAULT }}>
          <Box alignItems="center">
            <Text style={{ fontSize: 56 }}>{'\uD83C\uDFC6'}</Text>
            <Text variant="h1" color={theme.colors.success.DEFAULT} mt={2}>GAMBLE WON!</Text>
            <Text variant="h3" color={theme.colors.text.primary} mt={1}>Grade {outcome.grade} - Streak Saved!</Text>
            <Box mt={4} alignItems="center">
              <Text variant="body" color={theme.colors.text.secondary}>Your skill saved the day!</Text>
              <Box flexDirection="row" alignItems="center" gap={2} mt={2}>
                <Text style={{ fontSize: 24 }}>{'\u2B50'}</Text>
                <Text variant="h3" color={theme.colors.warning.DEFAULT}>+{outcome.xpEarned} Bonus XP</Text>
              </Box>
              {outcome.shieldPreserved && (
                <Text variant="bodySmall" color={theme.colors.success.DEFAULT} mt={1}>{'\uD83D\uDEE1\uFE0F'} Shield preserved for future use</Text>
              )}
            </Box>
            <Box mt={5}>
              <Button variant="primary" size="md" onPress={onDismiss} accessibilityLabel="Continue button" accessibilityRole="button" accessibilityHint="Activates this control">Continue</Button>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  if (gambleState === 'lost' && outcome) {
    return (
      <Animated.View entering={FadeInUp.springify()}>
        <Box p={5} borderRadius={20} bg={theme.colors.background.secondary} style={{ borderWidth: 2, borderColor: theme.colors.error.DEFAULT }}>
          <Box alignItems="center">
            <Text style={{ fontSize: 48 }}>{'\uD83D\uDC94'}</Text>
            <Text variant="h2" color={theme.colors.error.DEFAULT} mt={2}>Gamble Failed</Text>
            <Text variant="h4" color={theme.colors.text.secondary} mt={1}>Grade {outcome.grade} - Streak Broken</Text>
            <Box mt={4} p={4} borderRadius={12} bg={theme.colors.background.primary}>
              <Text variant="body" color={theme.colors.text.secondary} textAlign="center">
                {"You gave it your best shot!\nYour "}{streakDays}{'-day streak will reset.'}
              </Text>
            </Box>
            <Box mt={3}>
              <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center">
                {'\uD83D\uDEE1\uFE0F'} Good news: Your shield {"wasn't"} used
              </Text>
            </Box>
            <Box mt={5}>
              <Button variant="primary" size="md" onPress={onDismiss} accessibilityLabel="Start Fresh button" accessibilityRole="button" accessibilityHint="Activates this control">Start Fresh</Button>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    );
  }

  return null;
};

export default StreakGamblePrompt;
