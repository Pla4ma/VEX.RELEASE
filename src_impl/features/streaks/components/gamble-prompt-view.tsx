/** Gamble Prompt View - renders the main prompt state of the streak gamble dialog. */

import React from 'react';
import Animated from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import { getRiskText, type RiskColors } from './gamble-logic';
import { GAMBLE_BONUS_XP, type StreakGamblePromptProps } from './gamble-types';
import type { ViewStyle } from 'react-native';

interface GamblePromptViewProps {
  streakDays: number;
  hoursRemaining: number;
  shieldsAvailable: number;
  shakeStyle: ViewStyle;
  countdownStyle: ViewStyle;
  glowStyle: ViewStyle;
  pulseStyle: ViewStyle;
  onUseShield: StreakGamblePromptProps['onUseShield'];
  onGamble: () => void;
  onDismiss: StreakGamblePromptProps['onDismiss'];
}

export const GamblePromptView: React.FC<GamblePromptViewProps> = ({
  streakDays,
  hoursRemaining,
  shieldsAvailable,
  shakeStyle,
  countdownStyle,
  glowStyle,
  pulseStyle,
  onUseShield,
  onGamble,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const errColor = theme.colors.error.DEFAULT;
  const warnColor = theme.colors.warning.DEFAULT;
  const riskColors: RiskColors = { error: errColor, warning: warnColor };
  const riskInfo = getRiskText(hoursRemaining, riskColors);

  return (
    <Animated.View>
      <Box
        p={5}
        borderRadius={20}
        bg={theme.colors.background.secondary}
        style={{ borderWidth: 3, borderColor: errColor, shadowColor: errColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
      >
        <Box alignItems="center" mb={4}>
          <Animated.View style={[shakeStyle]}>
            <Text variant="h2" color={riskInfo.color} style={{ textShadowColor: riskInfo.color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>
              {'\uD83D\uDD25'} STREAK AT RISK!
            </Text>
          </Animated.View>
          <Box flexDirection="row" alignItems="baseline" gap={1} mt={2}>
            <Animated.View style={countdownStyle}>
              <Text variant="hero" color={errColor}>
                {Math.ceil(hoursRemaining * 10) / 10}h
              </Text>
            </Animated.View>
            <Text variant="body" color={theme.colors.text.secondary}>
              until your {streakDays}-day streak breaks
            </Text>
          </Box>
          <Text variant="caption" color={errColor} mt={1}>
            {riskInfo.text}
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" justifyContent="center" mb={5} p={4} borderRadius={16} bg={theme.colors.background.primary}>
          <Text style={{ fontSize: 32 }}>{'\uD83D\uDD25'}</Text>
          <Box ml={3}>
            <Text variant="h3" color={theme.colors.text.primary}>
              {streakDays} Day Streak
            </Text>
            <Text variant="caption" color={theme.colors.text.tertiary}>
              {"Don't lose your progress!"}
            </Text>
          </Box>
        </Box>
        <Box gap={3}>
          <Animated.View style={glowStyle}>
            <Button variant="primary" size="lg" fullWidth onPress={onUseShield} disabled={shieldsAvailable === 0} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
              <Box flexDirection="row" alignItems="center" gap={2}>
                <Text style={{ fontSize: 20 }}>{'\uD83D\uDEE1\uFE0F'}</Text>
                <Box alignItems="flex-start">
                  <Text color={theme.colors.text.inverse} fontWeight="bold">Use Streak Shield</Text>
                  <Text color={theme.colors.text.inverse} variant="caption" opacity={0.8}>
                    {shieldsAvailable > 0 ? `Save streak guaranteed (${shieldsAvailable} available)` : 'No shields available'}
                  </Text>
                </Box>
              </Box>
            </Button>
          </Animated.View>
          <Box flexDirection="row" alignItems="center" gap={3} my={2}>
            <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
            <Text variant="caption" color={theme.colors.text.tertiary}>OR GAMBLE</Text>
            <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
          </Box>
          <Button variant="outline" size="lg" fullWidth onPress={onGamble} style={{ borderColor: warnColor, borderWidth: 2 }} accessibilityLabel={'\uD83C\uDFB2 Take the Risk Start a session NOW - Score S or A to save streak button'} accessibilityRole="button" accessibilityHint="Activates this control">
            <Box flexDirection="row" alignItems="center" gap={2}>
              <Text style={{ fontSize: 20 }}>{'\uD83C\uDFB2'}</Text>
              <Box alignItems="flex-start">
                <Text color={warnColor} fontWeight="bold">Take the Risk</Text>
                <Text color={theme.colors.text.secondary} variant="caption">Start a session NOW - Score S or A to save streak</Text>
              </Box>
            </Box>
          </Button>
          <Animated.View style={[pulseStyle]}>
            <Box p={3} borderRadius={12} style={{ backgroundColor: `${warnColor}15`, borderWidth: 1, borderColor: `${warnColor}30` }}>
              <Text variant="caption" color={warnColor} textAlign="center">
                {'\u26A1'} If you score S or A: Streak saved + {GAMBLE_BONUS_XP} bonus XP!{'\n'}If below A: Streak breaks, no shield used
              </Text>
            </Box>
          </Animated.View>
        </Box>
        <Box mt={4} alignItems="center">
          <Button variant="ghost" size="sm" onPress={onDismiss} accessibilityLabel="I'll risk it (don't remind me) button" accessibilityRole="button" accessibilityHint="Activates this control">
            <Text color={theme.colors.text.tertiary}>{"I'll risk it (don't remind me)"}</Text>
          </Button>
        </Box>
      </Box>
    </Animated.View>
  );
};
