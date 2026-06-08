import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidLens } from '../../../components/glass/LiquidLens';
import { GlassRibbon } from '../../../components/glass/GlassRibbon';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
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
        {/* Large liquid lens decoration top-right */}
        <View
          pointerEvents="none"
          style={{
            opacity: 0.65,
            position: 'absolute',
            right: -42,
            top: -32,
            zIndex: 1,
          }}
        >
          <LiquidLens size={180} opacity={0.65} />
        </View>

        {/* Glass ribbon flowing through hero */}
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 20,
            top: 28,
            zIndex: 1,
          }}
        >
          <GlassRibbon curve="s" height={40} opacity={0.65} width={140} />
        </View>

        {/* Medium glass sphere accent */}
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: -8,
            top: 44,
            zIndex: 1,
          }}
        >
          <LiquidGlassSphere color="mint" size={52} intensity={0.82} />
        </View>

        {/* Small water bubble accent */}
        <View
          pointerEvents="none"
          style={{
            bottom: 28,
            opacity: 0.85,
            position: 'absolute',
            right: 52,
            zIndex: 1,
          }}
        >
          <WaterBubble opacity={0.55} size={52} />
        </View>

        {/* Tiny pearl sphere */}
        <View
          pointerEvents="none"
          style={{
            bottom: 64,
            opacity: 0.85,
            position: 'absolute',
            right: 98,
            zIndex: 1,
          }}
        >
          <LiquidGlassSphere color="pearl" intensity={0.62} size={22} />
        </View>

        {/* Floating droplets cluster */}
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 72,
            top: 8,
            zIndex: 1,
          }}
        >
          <FloatingDroplets count={5} opacity={0.65} size={48} />
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
        {/* Liquid time capsule with glass rim and inner glow */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.52)',
            borderColor: 'rgba(255, 255, 255, 0.88)',
            borderRadius: 14,
            borderWidth: 1.5,
            flexDirection: 'row',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            shadowColor: 'rgba(10, 155, 138, 0.12)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.85,
            shadowRadius: 6,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.78)',
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: 'rgba(10, 94, 77, 0.06)',
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
            }}
          />
          <Icon color="#6B8F85" name="clock" size="xs" variant="outline" />
          <Text
            style={{
              color: '#6B8F85',
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            ~30 min
          </Text>
        </View>
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
