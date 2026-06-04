import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { VexMotionSurface } from '../../../components/primitives/VexMotionSurface';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';

function getHeroTitle(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'STREAK_CRITICAL':
      return 'Your streak needs one clean save';
    case 'COMPANION_PROMISE':
      return 'Keep the promise alive today';
    case 'PROMISE_RECOVERY':
      return 'Start small and rebuild the thread';
    case 'STREAK_AT_RISK':
      return 'Protect the habit before it slips';
    case 'RECOMMENDED_SESSION':
      return 'VEX already has the next session ready';
    case 'CHALLENGE_NEAR_DONE':
      return 'You are close enough to finish this today';
    case 'BOSS_ACTIVE':
      return 'The battle is already in motion';
    case 'DEFAULT_SESSION':
      return 'VEX changes based on how you work';
  }
}

function getHeroEyebrow(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'COMPANION_PROMISE':
    case 'PROMISE_RECOVERY':
      return 'Companion thread';
    case 'CHALLENGE_NEAR_DONE':
      return 'Challenge';
    case 'BOSS_ACTIVE':
      return 'Boss run';
    case 'STREAK_AT_RISK':
    case 'STREAK_CRITICAL':
      return 'Habit protection';
    default:
      return 'Right next session';
  }
}

interface VexFocusSurfaceProps {
  isLoading: boolean;
  onPressPrimary: () => void;
  priority: HomePrimaryPriority | null;
  stakes: HomeStakes | null;
}

export function VexFocusSurface({
  isLoading,
  onPressPrimary,
  priority,
  stakes,
}: VexFocusSurfaceProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  if (isLoading || !priority) {
    return (
      <VexMotionSurface variant="elevated" style={{ minHeight: 220, padding: theme.spacing[5] }}>
        <Text variant="label" color="textMuted">
          Primary action
        </Text>
        <Text variant="h4" color="textPrimary" style={{ marginTop: theme.spacing[3] }}>
          Loading today&apos;s focus path...
        </Text>
      </VexMotionSurface>
    );
  }

  const entering = isReducedMotion ? undefined : FadeInUp.duration(500);

  return (
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <VexMotionSurface variant="focused" animated style={{ overflow: 'visible' }}>
        <LinearGradient
          colors={[lightColors.semantic.obsidian, lightColors.semantic.obsidian, lightColors.semantic.obsidian]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            borderRadius: theme.spacing[3] ?? 12,
            padding: theme.spacing[5],
            gap: theme.spacing[3],
          }}
        >
          {/* Top accent line */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: theme.spacing[5],
              right: theme.spacing[5],
              height: 1,
              backgroundColor: 'rgba(0,229,255,0.15)',
            }}
          />

          <Text
            variant="label"
            color="vexCyan"
            style={{ opacity: 0.9, letterSpacing: 1 }}
          >
            {getHeroEyebrow(priority.type).toUpperCase()}
          </Text>

          <Text variant="h3" color="textPrimary">
            {getHeroTitle(priority.type)}
          </Text>

          <Text variant="body" color="textSecondary" style={{ opacity: 0.72 }}>
            {priority.reason}
          </Text>

          {stakes ? (
            <VexMotionSurface
              variant="glass"
              style={{
                marginTop: theme.spacing[2],
                padding: theme.spacing[4],
                gap: theme.spacing[2],
              }}
            >
              <Text variant="label" color="textMuted" style={{ opacity: 0.62 }}>
                What matters now
              </Text>
              <Text variant="body" color="textPrimary">
                {stakes.what}
              </Text>
              {stakes.atRisk ? (
                <Text variant="bodySmall" color="textSecondary" style={{ opacity: 0.6 }}>
                  At risk: {stakes.atRisk}
                </Text>
              ) : null}
            </VexMotionSurface>
          ) : null}

          <Box mt="sm">
            <VexLaunchButton
              label={priority.cta.text}
              onPress={onPressPrimary}
            />
          </Box>
        </LinearGradient>
      </VexMotionSurface>
    </Animated.View>
  );
}
