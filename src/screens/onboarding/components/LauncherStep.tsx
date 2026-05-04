import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { getHeroGradientColors } from '../../home/HomeScreenVisuals';
import { styles } from '../styles';
import type { StarterPreset } from './onboarding-flow-data';

type LauncherStepProps = {
  firstSessionXp: number;
  hasSeenFirstWin: boolean;
  isFinishing: boolean;
  isLaunchingSession: boolean;
  onFinishOnboarding: (message?: string) => void;
  onStartFirstSession: () => void;
  selectedPreset: StarterPreset | undefined;
};

export function LauncherStep({
  firstSessionXp,
  hasSeenFirstWin,
  isFinishing,
  isLaunchingSession,
  onFinishOnboarding,
  onStartFirstSession,
  selectedPreset,
}: LauncherStepProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const stepPadding = { paddingBottom: insets.bottom + theme.spacing[6], paddingTop: theme.spacing[6] };

  if (hasSeenFirstWin) {
    return (
      <View style={[styles.fullStepSection, stepPadding]}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={[styles.lockInTitle, styles.centerText, { color: theme.colors.text.primary }]}>
            Your first win is saved.
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(150).duration(500)}>
          <Text style={[styles.lockInBody, styles.centerText, { color: theme.colors.text.secondary }]}>
            VEX can now show streaks, rewards, and the next best focus action from real progress.
          </Text>
        </Animated.View>
        <View style={styles.celebrationStats}>
          {['1 day streak started', `${firstSessionXp} XP earned`, 'Session 1 complete'].map((stat, index) => (
            <Animated.View
              entering={FadeInUp.delay(250 + index * 80).duration(450)}
              key={stat}
              style={[
                styles.celebrationStatCard,
                { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.DEFAULT, padding: theme.spacing[4] },
              ]}
            >
              <Text style={[styles.celebrationStatText, { color: theme.colors.text.primary }]}>{stat}</Text>
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.fullWidth}>
          <Button fullWidth onPress={() => onFinishOnboarding('Your first session is saved. Keep the streak alive from Home.')} isDisabled={isFinishing} isLoading={isFinishing} accessibilityLabel="Enter VEX" accessibilityRole="button" accessibilityHint="Opens the VEX home screen">
            Enter VEX
          </Button>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.fullStepSection, stepPadding]}>
      {selectedPreset ? (
        <LinearGradient colors={[...getHeroGradientColors(0)]} style={[styles.launchGradientCard, { borderRadius: theme.borderRadius['3xl'], padding: theme.spacing[5] }]}>
          <Text color={theme.colors.text.inverse} style={styles.launchLabel}>First value moment</Text>
          <Text color={theme.colors.text.inverse} style={styles.launchTitle}>{selectedPreset.title}</Text>
          <Text color={theme.colors.text.inverse} style={styles.launchDurationLight}>{selectedPreset.durationLabel}</Text>
          <Text color={theme.colors.text.inverse} style={styles.launchDescription}>{selectedPreset.launchDescription}</Text>
        </LinearGradient>
      ) : null}
      <View style={styles.fullWidth}>
        <Button fullWidth onPress={onStartFirstSession} isDisabled={!selectedPreset || isLaunchingSession || isFinishing} isLoading={isLaunchingSession} accessibilityLabel={selectedPreset ? `Start ${selectedPreset.durationLabel} session` : 'Start session'} accessibilityRole="button" accessibilityHint="Opens the session setup screen with your starter session selected">
          {selectedPreset ? `Start ${selectedPreset.durationLabel} Session` : 'Start Session'}
        </Button>
      </View>
      <Button variant="ghost" onPress={() => onFinishOnboarding('Start your first session from Home when you are ready.')} isDisabled={isFinishing || isLaunchingSession} isLoading={isFinishing} accessibilityLabel="Skip first session for now" accessibilityRole="button" accessibilityHint="Finishes onboarding and opens Home without starting a session">
        Skip first session for now
      </Button>
      <Text style={[styles.progressHint, { color: theme.colors.text.secondary }]}>
        Completing the first session starts your streak and unlocks useful progress feedback.
      </Text>
    </View>
  );
}
