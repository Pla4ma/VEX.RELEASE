import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { Icon } from '../../../icons';
import type {
  HomePrimaryPriority,
  HomeStakes,
} from '../../../features/home-spine/priority-schemas';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getHeroEyebrow, getHeroTitle } from './VexFocusSurfaceCopy';
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
    <Animated.View entering={entering} style={{ width: '100%' }}>
      <GlassCard padding={18} radius={28} variant="hero">
        {/* Large water bubble decoration top-right */}
        <View
          pointerEvents="none"
          style={{
            opacity: 0.55,
            position: 'absolute',
            right: -28,
            top: -22,
            zIndex: 1,
          }}
        >
          <WaterBubble size={140} opacity={0.65} />
        </View>

        {/* Small water bubble accent */}
        <View
          pointerEvents="none"
          style={{
            bottom: 40,
            opacity: 0.35,
            position: 'absolute',
            right: 70,
            zIndex: 1,
          }}
        >
          <WaterBubble size={48} opacity={0.45} />
        </View>

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
            size="sm"
            variant="mint"
          />
        </View>

        <View style={{ maxWidth: '66%', zIndex: 2 }}>
          <Text
            style={{
              color: '#0A1F1A',
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.5,
              lineHeight: 28,
              marginBottom: 6,
            }}
          >
            {getHeroTitle(priority.type)}
          </Text>
          <Text
            style={{
              color: '#3D5A52',
              fontSize: 13,
              lineHeight: 19,
              fontWeight: '400',
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
            marginBottom: 12,
            marginTop: 10,
            zIndex: 2,
          }}
        >
          <GlassPill label="Adaptive" size="sm" variant="mint" />
          <GlassPill label={secondBadge} size="sm" variant="neutral" />
        </View>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 14,
            zIndex: 2,
          }}
        >
          <View style={{ maxWidth: 220 }}>
            <LiquidButton
              accessibilityHint="Opens the recommended next VEX action"
              label={ctaLabel}
              onPress={onPressPrimary}
              rightIcon={
                <Icon
                  color="#FFFFFF"
                  name="arrowRight"
                  size="sm"
                  variant="solid"
                />
              }
              size="md"
              variant="primary"
            />
          </View>
          <Text
            style={{
              color: '#6B8F85',
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            ~30 min
          </Text>
        </View>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            marginTop: 10,
            zIndex: 2,
          }}
        >
          <Icon
            color="#6B8F85"
            name="chevronRight"
            size="xs"
            variant="solid"
          />
          <Text
            style={{
              color: '#6B8F85',
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            Next move is saved. Open the thread.
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default VexFocusSurface;
