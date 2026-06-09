import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Text } from '../../../components/primitives/Text';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { StakesCard } from './StakesCard';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';
import { VexFocusSkeleton } from './VexFocusSurface.skeleton';
import { VexFocusSurfaceActionRow } from './VexFocusSurfaceActionRow';
import { VexFocusSurfaceDecor } from './VexFocusSurfaceDecor';

interface VexFocusSurfaceProps {
  isLoading: boolean;
  onPressPrimary: () => void;
  priority: HomePrimaryPriority | null;
  stakes: HomeStakes | null;
}

function getSecondBadge(priority: HomePrimaryPriority): string {
  const actionLabelMap: Record<string, string> = {
    OPEN_BOSS: 'Boss',
    OPEN_CHALLENGES: 'Challenges',
    OPEN_MONTHLY_REPORT: 'Report',
    OPEN_SESSION_SETUP: 'Project Work',
    OPEN_STUDY: 'Study',
  };

  return actionLabelMap[priority.cta.action] ?? priority.cta.action.replace('_', ' ');
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

  const ctaLabel =
    priority.type === 'DEFAULT_SESSION' ? 'Resume project' : priority.cta.text;
  const entering = isReducedMotion ? undefined : FadeInUp.duration(420);

  return (
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <GlassCard padding={16} radius={26} variant="hero">
        <VexFocusSurfaceDecor />
        <View style={{ alignItems: 'flex-start', marginBottom: 10, zIndex: 2 }}>
          <GlassPill
            label={getHeroEyebrow(priority.type).toUpperCase()}
            size="sm"
            variant="mint"
          />
        </View>
        <View style={{ maxWidth: '68%', zIndex: 2 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: 0,
              lineHeight: 28,
              marginBottom: 8,
            }}
          >
            {getHeroTitle(priority.type)}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              fontWeight: '400',
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
            marginTop: 12,
            zIndex: 2,
          }}
        >
          <GlassPill label="Adaptive" size="sm" variant="mint" />
          <GlassPill label={getSecondBadge(priority)} size="sm" variant="neutral" />
        </View>
        <VexFocusSurfaceActionRow
          ctaLabel={ctaLabel}
          onPressPrimary={onPressPrimary}
        />
      </GlassCard>
    </Animated.View>
  );
}

export default VexFocusSurface;
