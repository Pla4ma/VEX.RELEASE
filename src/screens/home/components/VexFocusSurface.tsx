import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';
import { VexFocusSkeleton } from './VexFocusSurface.skeleton';
import { StakesCard } from './StakesCard';
import { VexFocusFooter } from './VexFocusSurface.footer';

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
  const ctaLabel =
    priority.type === 'DEFAULT_SESSION' ? 'Resume project' : priority.cta.text;
  const actionLabelMap: Record<string, string> = {
    OPEN_SESSION_SETUP: 'Project Work',
    OPEN_STUDY: 'Study',
    OPEN_BOSS: 'Boss',
    OPEN_CHALLENGES: 'Challenges',
    OPEN_MONTHLY_REPORT: 'Report',
  };
  const secondBadge = actionLabelMap[priority.cta.action] ?? priority.cta.action.replace('_', ' ');

  return (
    <Animated.View entering={entering}>
      <GlassCard variant="hero" padding={18} radius={28}>
        <View pointerEvents="none" style={{
          position: 'absolute', right: -40, top: -60, opacity: 0.55,
        }}>
          <WaterBubble />
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 8, zIndex: 2,
        }}>
          <Text style={{
            color: '#6B8F85', fontSize: 12, fontWeight: '600', letterSpacing: 1.5,
          }}>{getHeroEyebrow(priority.type)}</Text>
        </View>

        <View style={{ marginBottom: 16, zIndex: 2 }}>
          <Text style={{
            color: '#0A1F1A', fontSize: 22, fontWeight: '800',
            letterSpacing: -0.5, lineHeight: 28, marginBottom: 6,
          }}>{getHeroTitle(priority.type)}</Text>
          <Text style={{
            color: '#3D5A52', fontSize: 13, lineHeight: 19, fontWeight: '400',
          }}>{priority.reason}</Text>
        </View>

        {stakes ? <StakesCard stakes={stakes} /> : null}

        <View style={{
          flexDirection: 'row', flexWrap: 'wrap', gap: 8,
          marginBottom: 12, marginTop: 10, zIndex: 2,
        }}>
          <GlassPill label="Adaptive" size="sm" variant="mint" />
          <GlassPill label={secondBadge} size="sm" variant="neutral" />
        </View>

        <VexFocusFooter ctaLabel={ctaLabel} onPressPrimary={onPressPrimary} />
      </GlassCard>
    </Animated.View>
  );
}

export default VexFocusSurface;
