import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { VexLaunchButton } from '../../../components/primitives/VexLaunchButton';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';
import { VexFocusDecorations } from './VexFocusDecorations';
import { VexFocusSkeleton } from './VexFocusSurface.skeleton';
import { StakesCard } from './StakesCard';

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
  const { isReducedMotion } = useReducedMotion();

  if (isLoading || !priority) {
    return <VexFocusSkeleton />;
  }

  const entering = isReducedMotion ? undefined : FadeInUp.duration(500);
  const ctaLabel = priority.cta.text;
  const secondBadge = priority.cta.action.replace('_', ' ');

  return (
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <GlassCard padding={20} radius={32} variant="hero">
        <VexFocusDecorations />

        <View
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: 8,
            marginBottom: 10,
            zIndex: 2,
          }}
        >
          <GlassPill
            label={getHeroEyebrow(priority.type).toUpperCase()}
            variant="mint"
          />
        </View>

        <View style={{ maxWidth: '68%', zIndex: 2 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 26,
              fontWeight: '800',
              letterSpacing: -0.5,
              lineHeight: 32,
              marginBottom: 8,
            }}
          >
            {getHeroTitle(priority.type)}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              lineHeight: 19,
            }}
          >
            {priority.reason}
          </Text>
        </View>

        {stakes ? <StakesCard stakes={stakes} /> : null}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
            marginTop: 4,
            zIndex: 2,
          }}
        >
          <GlassPill label="Adaptive" variant="mint" />
          <GlassPill label={secondBadge} variant="neutral" />
        </View>

        <VexLaunchButton
          accessibilityHint="Opens the recommended next VEX action"
          label={ctaLabel}
          onPress={onPressPrimary}
        />
      </GlassCard>
    </Animated.View>
  );
}
