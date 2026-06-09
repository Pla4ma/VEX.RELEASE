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
import { ModeNativeHomeDecorations } from './ModeNativeHome.decorations';
import { FirstContractCard } from './ModeNativeHome.contract';
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
      <GlassCard variant="hero" padding={18} radius={28}>
        <ModeNativeHomeDecorations />

        <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 8, marginBottom: 12, zIndex: 2 }}>
          <GlassPill label="DAILY FOCUS" variant="mint" />
        </View>

        <View style={{ marginBottom: 14, maxWidth: '68%', zIndex: 2 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 24,
              fontWeight: '800',
              letterSpacing: -0.6,
              lineHeight: 30,
              marginBottom: 8,
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

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, zIndex: 2 }}>
          <GlassPill label="Adaptive" variant="mint" />
          <GlassPill label={`${laneLabel} mode`} variant="neutral" />
        </View>

        <FirstContractCard
          suggestedDurationMinutes={surface.suggestedDurationMinutes}
          rhythmLabel={surface.rhythmLabel}
        />

        <View style={{ flex: 1 }} />

        <VexLaunchButton
          accessibilityHint={surface.secondaryHint ?? 'Start your first adaptive VEX session'}
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
