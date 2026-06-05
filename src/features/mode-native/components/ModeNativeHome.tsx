import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { AuroraField } from '../../../components/primitives/AuroraField';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { VexMotionSurface } from '../../../components/primitives/VexMotionSurface';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { lightColors } from '../../../theme/tokens/colors';
import { timingPresets } from '../../../theme/tokens/motion';
import { rgbaColors } from '../../../theme/tokens/rgba-colors';
import { useModeHomeSurface } from '../hooks';
import type { Lane } from '../../lane-engine/types';
import type { HomeContext } from '../service';

interface ModeNativeHomeProps {
  lane: Lane | null | undefined;
  homeContext: HomeContext;
  onStart: () => void;
}

export function ModeNativeHome({
  lane,
  homeContext,
  onStart,
}: ModeNativeHomeProps): JSX.Element {
  const context: HomeContext = {
    ...homeContext,
    laneOverride: lane,
  };
  const surface = useModeHomeSurface(context);
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion
    ? undefined
    : FadeInUp.duration(timingPresets.cinematicReveal.duration);
  const bloomSize = theme.spacing[20] * 4 + theme.spacing[5];
  const bloomOffset = -(theme.spacing[24] + theme.spacing[6]);
  const panelMinHeight =
    theme.spacing[24] * 5 + theme.spacing[8] + theme.spacing[2];
  const laneLabel =
    surface.lane === 'student'
      ? 'Study'
      : surface.lane === 'game_like'
        ? 'Run'
        : surface.lane === 'deep_creative'
          ? 'Project'
          : 'Clean';

  return (
    <Animated.View
      entering={entering}
      style={{ flex: 1, justifyContent: 'center' }}
    >
      <VexMotionSurface variant="focused" animated style={{ overflow: 'visible' }}>
        <Box
          gap="lg"
          minHeight={panelMinHeight}
          overflow="hidden"
          p="lg"
          style={{ borderRadius: theme.borderRadius.xl }}
        >
          <AuroraField
            colors={[
              lightColors.semantic.vexCyanGlow,
              lightColors.semantic.editorialGoldGlow,
              rgbaColors.rgb_139_92_246_0_18,
            ]}
            intensity={theme.opacity[60]}
            size={bloomSize}
            style={{
              position: 'absolute',
              right: bloomOffset,
              top: -(theme.spacing[24] + theme.spacing[5]),
            }}
          />
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: rgbaColors.rgb_255_255_255_0_06,
              borderColor: rgbaColors.rgb_255_255_255_0_18,
              borderRadius: theme.borderRadius.full,
              borderWidth: theme.spacing[0] + 1,
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[2],
            }}
          >
            <Text variant="caption" color="vexCyan" textTransform="uppercase">
              {laneLabel} mode
            </Text>
          </View>

          <Box gap="sm">
            <Text variant="display" color="textPrimary">
              {surface.headline}
            </Text>
            <Text variant="bodyLarge" color="textSecondary" opacity={theme.opacity[80]}>
              {surface.body}
            </Text>
          </Box>

          <VexMotionSurface
            variant="chrome"
            style={{ gap: theme.spacing[2], padding: theme.spacing[4] }}
          >
            <Text variant="label" color="textMuted">
              First contract
            </Text>
            <Text variant="h4" color="textPrimary">
              {surface.suggestedDurationMinutes} minutes, one clean start.
            </Text>
            {surface.rhythmLabel ? (
              <Text variant="bodySmall" color="textSecondary" opacity={theme.opacity[70]}>
                {surface.rhythmLabel}
              </Text>
            ) : null}
          </VexMotionSurface>

          <Box flex={1} />

          <VexLaunchButton
            accessibilityHint={
              surface.secondaryHint ?? 'Start your first adaptive VEX session'
            }
            label={surface.primaryActionLabel}
            onPress={onStart}
            subLabel={`~${surface.suggestedDurationMinutes} minutes`}
          />

          {surface.secondaryHint ? (
            <Text variant="caption" color="textMuted" textAlign="center">
              {surface.secondaryHint}
            </Text>
          ) : null}
        </Box>
      </VexMotionSurface>
    </Animated.View>
  );
}
