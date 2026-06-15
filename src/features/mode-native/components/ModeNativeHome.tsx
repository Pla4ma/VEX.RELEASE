import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { timingPresets } from '../../../theme/tokens/motion';
import { useModeHomeSurface } from '../hooks';
import type { Lane } from '../../lane-engine/types';
import type { HomeContext } from '../service';
import { ModeNativeHeroDecor } from './ModeNativeHeroDecor';

interface ModeNativeHomeProps {
  lane: Lane | null | undefined;
  homeContext: HomeContext;
  onStart: () => void;
}

export function ModeNativeHome({
  lane,
  homeContext,
  onStart,
}: ModeNativeHomeProps): React.ReactNode {
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
        ? 'Quest'
        : surface.lane === 'deep_creative'
          ? 'Create'
          : 'Focus';

  return (
    <Animated.View
      entering={entering}
      style={{ flex: 1, justifyContent: 'flex-start' }}
    >
      <GlassCard variant="hero" padding={18} radius={28}>
        <ModeNativeHeroDecor />

        <View
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: 8,
            marginBottom: 12,
            zIndex: 2,
          }}
        >
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

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
            zIndex: 2,
          }}
        >
          <GlassPill label="Adaptive" variant="mint" />
          <GlassPill label={`${laneLabel} mode`} variant="neutral" />
        </View>

        <GlassCard
          padding={14}
          radius={20}
          size="md"
          style={{ marginBottom: 16 }}
          variant="subtle"
        >
          <View>
            <Text
              style={{
                color: vexLightGlass.mint[700],
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 1.4,
                marginBottom: 6,
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
                lineHeight: 20,
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
