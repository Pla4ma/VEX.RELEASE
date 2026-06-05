import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { VexMotionSurface } from '../../../components/primitives/VexMotionSurface';
import { AuroraField } from '../../../components/primitives/AuroraField';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';

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
  const heroMinHeight =
    theme.spacing[24] * 3 + theme.spacing[12] + theme.spacing[1];
  const loadingMinHeight = theme.spacing[20] * 3 + theme.spacing[5];
  const bloomSize = theme.spacing[20] * 3 + theme.spacing[5];
  const bloomOffset = -theme.spacing[20];

  if (isLoading || !priority) {
    return (
      <VexMotionSurface
        variant="chrome"
        style={{
          gap: theme.spacing[4],
          minHeight: loadingMinHeight,
          padding: theme.spacing[5],
        }}
      >
        <Text variant="label" color="textMuted">
          Primary action
        </Text>
        <View
          style={{
            backgroundColor: rgbaColors.rgb_255_255_255_0_12,
            borderRadius: theme.borderRadius.lg,
            height: theme.spacing[16],
            width: '88%',
          }}
        />
        <View
          style={{
            backgroundColor: rgbaColors.rgb_255_255_255_0_06,
            borderRadius: theme.borderRadius.md,
            height: theme.spacing[4],
            width: '72%',
          }}
        />
        <Text variant="h4" color="textPrimary">
          Loading today's focus path...
        </Text>
      </VexMotionSurface>
    );
  }

  const entering = isReducedMotion ? undefined : FadeInUp.duration(500);

  return (
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <VexMotionSurface variant="focused" animated style={{ overflow: 'visible' }}>
        <LinearGradient
          colors={[
            lightColors.semantic.liquidNight,
            lightColors.semantic.obsidian,
            lightColors.semantic.background,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            borderRadius: theme.borderRadius.xl,
            minHeight: heroMinHeight,
            padding: theme.spacing[5],
            gap: theme.spacing[3],
          }}
        >
          <AuroraField
            colors={[
              lightColors.semantic.vexCyanGlow,
              lightColors.semantic.editorialGoldGlow,
              rgbaColors.rgb_139_92_246_0_25,
            ]}
            intensity={theme.opacity[50]}
            size={bloomSize}
            style={{
              position: 'absolute',
              right: bloomOffset,
              top: bloomOffset,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: theme.spacing[5],
              right: theme.spacing[5],
              height: theme.spacing[0] + 1,
              backgroundColor: rgbaColors.rgb_0_229_255_0_08,
            }}
          />

          <Text
            variant="label"
            color="vexCyan"
            style={{
              letterSpacing: theme.spacing[0] + 1,
              opacity: theme.opacity[90],
            }}
          >
            {getHeroEyebrow(priority.type).toUpperCase()}
          </Text>

          <Text variant="h3" color="textPrimary">
            {getHeroTitle(priority.type)}
          </Text>

          <Text variant="body" color="textSecondary" opacity={theme.opacity[70]}>
            {priority.reason}
          </Text>

          {stakes ? (
            <VexMotionSurface
              variant="chrome"
              style={{
                marginTop: theme.spacing[2],
                padding: theme.spacing[4],
                gap: theme.spacing[2],
              }}
            >
              <Text variant="label" color="textMuted" opacity={theme.opacity[60]}>
                What matters now
              </Text>
              <Text variant="body" color="textPrimary">
                {stakes.what}
              </Text>
              {stakes.atRisk ? (
                <Text variant="bodySmall" color="textSecondary" opacity={theme.opacity[60]}>
                  At risk: {stakes.atRisk}
                </Text>
              ) : null}
            </VexMotionSurface>
          ) : null}

          <Box flexDirection="row" flexWrap="wrap" gap="sm">
            <VexMotionSurface
              variant="glass"
              style={{ paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[2] }}
            >
              <Text variant="caption" color="vexCyan">
                Adaptive
              </Text>
            </VexMotionSurface>
            <VexMotionSurface
              variant="glass"
              style={{ paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[2] }}
            >
              <Text variant="caption" color="textSecondary">
                {priority.cta.action.replace('_', ' ')}
              </Text>
            </VexMotionSurface>
          </Box>

          <Box mt="sm">
            <VexLaunchButton
              label={priority.cta.text}
              onPress={onPressPrimary}
              accessibilityHint="Opens the recommended next VEX action"
            />
          </Box>
        </LinearGradient>
      </VexMotionSurface>
    </Animated.View>
  );
}
