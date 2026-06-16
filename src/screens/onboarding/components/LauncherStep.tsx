import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
}: LauncherStepProps): React.ReactNode {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const stepPadding = {
    paddingBottom: insets.bottom + theme.spacing[6],
    paddingTop: theme.spacing[6],
  };

  if (hasSeenFirstWin) {
    return (
      <View style={[styles.fullStepSection, stepPadding]}>
        <View>
          <Text
            style={[
              styles.lockInTitle,
              styles.centerText,
              { color: theme.colors.text.primary },
            ]}
          >
            Your first session is saved.
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.lockInBody,
              styles.centerText,
              { color: theme.colors.text.secondary },
            ]}
          >
            VEX is learning what helps you start. Come back tomorrow and it will
            be ready.
          </Text>
        </View>
        <View style={styles.celebrationStats}>
          {[
            'Session complete',
            'Progress saved',
            'VEX is learning',
          ].map((stat) => (
            <View
              key={stat}
              style={[
                styles.celebrationStatCard,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.DEFAULT,
                  padding: theme.spacing[4],
                },
              ]}
            >
              <Text
                style={[
                  styles.celebrationStatText,
                  { color: theme.colors.text.primary },
                ]}
              >
                {stat}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.fullWidth}>
          <Button
            fullWidth
            onPress={() =>
              onFinishOnboarding(
                'Your first session is complete. Come back tomorrow.',
              )
            }
            isDisabled={isFinishing}
            isLoading={isFinishing}
            accessibilityLabel="Enter VEX"
            accessibilityRole="button"
            accessibilityHint="Opens the VEX home screen"
          >
            Enter VEX
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fullStepSection, stepPadding]}>
      {selectedPreset ? (
        <LinearGradient
          colors={[...getHeroGradientColors(0)]}
          style={[
            styles.launchGradientCard,
            {
              borderRadius: theme.borderRadius['3xl'],
              padding: theme.spacing[5],
            },
          ]}
        >
          <Text color={theme.colors.text.inverse} style={styles.launchLabel}>
            Your first session
          </Text>
          <Text color={theme.colors.text.inverse} style={styles.launchTitle}>
            {selectedPreset.title}
          </Text>
          <Text
            color={theme.colors.text.inverse}
            style={styles.launchDurationLight}
          >
            {selectedPreset.durationLabel}
          </Text>
          <Text
            color={theme.colors.text.inverse}
            style={styles.launchDescription}
          >
            {selectedPreset.launchDescription}
          </Text>
        </LinearGradient>
      ) : null}
      <View style={styles.fullWidth}>
        <Button
          fullWidth
          onPress={onStartFirstSession}
          isDisabled={!selectedPreset || isLaunchingSession || isFinishing}
          isLoading={isLaunchingSession}
          accessibilityLabel={
            selectedPreset
              ? `Start ${selectedPreset.durationLabel} session`
              : 'Start session'
          }
          accessibilityRole="button"
          accessibilityHint="Opens the session setup screen with your starter session selected"
        >
          {selectedPreset
            ? `Start ${selectedPreset.durationLabel} Session`
            : 'Start Session'}
        </Button>
      </View>
      <Text
        style={[styles.progressHint, { color: theme.colors.text.secondary }]}
      >
        Home unlocks after one session so VEX can adapt from real progress —
        not empty predictions.
      </Text>
    </View>
  );
}
