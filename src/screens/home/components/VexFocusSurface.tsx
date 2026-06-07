import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';
import { StakesCard } from './StakesCard';

interface VexFocusSurfaceProps {
  isLoading: boolean;
  onPressPrimary: () => void;
  priority: HomePrimaryPriority | null;
  stakes: HomeStakes | null;
}

function VexFocusSkeleton(): JSX.Element {
  return (
    <GlassCard padding={20} radius={32} variant="hero">
      <View style={{ gap: 12 }}>
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.10)',
            borderRadius: 999,
            height: 12,
            width: 96,
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.10)',
            borderRadius: 14,
            height: 32,
            width: '70%',
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 8,
            height: 14,
            width: '88%',
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 8,
            height: 14,
            width: '72%',
          }}
        />
      </View>
    </GlassCard>
  );
}

export function VexFocusSurface({
  isLoading,
  onPressPrimary,
  priority,
  stakes,
}: VexFocusSurfaceProps): JSX.Element {
  const { isReducedMotion } = useReducedMotion();

  if (isLoading || !priority) {
    return <VexFocusSkeleton />;
  }

  const entering = isReducedMotion ? undefined : FadeInUp.duration(500);

  return (
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <GlassCard padding={16} radius={20} variant="hero">
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.12)',
            borderRadius: 200,
            height: 130,
            position: 'absolute',
            right: -34,
            top: -40,
            width: 130,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(132, 228, 229, 0.10)',
            borderRadius: 160,
            height: 90,
            position: 'absolute',
            right: 40,
            top: 20,
            width: 90,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.50)',
            borderRadius: 200,
            height: 100,
            left: 50,
            position: 'absolute',
            top: 8,
            width: 100,
          }}
        />
        <LiquidGlassObject
          size={92}
          variant="swirl"
          style={{
            position: 'absolute',
            right: 14,
            top: 14,
          }}
        />
        <View
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <GlassPill
            label={getHeroEyebrow(priority.type).toUpperCase()}
            variant="mint"
          />
        </View>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 24,
            fontWeight: '800',
            letterSpacing: -0.4,
            lineHeight: 30,
            marginBottom: 8,
            maxWidth: '66%',
          }}
        >
          {getHeroTitle(priority.type)}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
            marginBottom: 12,
            maxWidth: '72%',
          }}
        >
          {priority.reason}
        </Text>
        {stakes ? <StakesCard stakes={stakes} /> : null}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <GlassPill label="Adaptive" variant="mint" />
          <GlassPill
            label={priority.cta.action.replace('_', ' ')}
            variant="neutral"
          />
        </View>
        <VexLaunchButton
          accessibilityHint="Opens the recommended next VEX action"
          label={priority.cta.text}
          onPress={onPressPrimary}
        />
      </GlassCard>
    </Animated.View>
  );
}
