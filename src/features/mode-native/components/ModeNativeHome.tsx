import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { timingPresets } from '../../../theme/tokens/motion';
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
      style={{ flex: 1, justifyContent: 'flex-start' }}
    >
      <GlassCard variant="hero" padding={18} radius={24}>
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.22)',
            borderRadius: 200,
            height: 180,
            position: 'absolute',
            right: -50,
            top: -80,
            width: 180,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(132, 228, 229, 0.20)',
            borderRadius: 180,
            height: 120,
            position: 'absolute',
            right: 30,
            top: 20,
            width: 120,
          }}
        />

        <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
          <GlassPill label={`${laneLabel} mode`} variant="mint" />
        </View>

        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.5,
              lineHeight: 33,
            }}
          >
            {surface.headline}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            {surface.body}
          </Text>
        </View>

        <GlassCard variant="subtle" padding={12} radius={18} size="sm" style={{ marginBottom: 12 }}>
          <View>
            <Text
              style={{
                color: vexLightGlass.mint[700],
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1.2,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              First contract
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 14,
                fontWeight: '700',
                lineHeight: 19,
              }}
            >
              {surface.suggestedDurationMinutes} minutes, one clean start.
            </Text>
            {surface.rhythmLabel ? (
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {surface.rhythmLabel}
              </Text>
            ) : null}
          </View>
        </GlassCard>

        <View style={{ flex: 1 }} />

        <VexLaunchButton
          accessibilityHint={
            surface.secondaryHint ?? 'Start your first adaptive VEX session'
          }
          label={surface.primaryActionLabel}
          onPress={onStart}
          subLabel={`~${surface.suggestedDurationMinutes} minutes`}
        />

        {surface.secondaryHint ? (
          <Text
            style={{
              color: vexLightGlass.text.tertiary,
              fontSize: 12,
              fontWeight: '500',
              marginTop: 10,
              textAlign: 'center',
            }}
          >
            {surface.secondaryHint}
          </Text>
        ) : null}
      </GlassCard>
      <View style={{ height: theme.spacing[4] }} />
    </Animated.View>
  );
}
