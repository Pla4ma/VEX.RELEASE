/**
 * HomeHeroSection — full-bleed returning-user hero with visible art stage.
 */
import React from 'react';
import { Image, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { HomeController } from '../hooks/home-controller-types';
import {
  homeGreeting,
  HomeGoalRing,
  HomeStatChip,
} from './HomeHeroVisuals';

// SAFETY: require() for Metro asset bundling.
const MASCOT = require('../../../../assets/mascot/mascot_wave.png');
const SCULPTURE = require('../../../../assets/water/vex_liquid_sculpture_v1.png');

interface HomeHeroSectionProps {
  controller: HomeController;
  onStartSession: () => void;
}

export function HomeHeroSection({
  controller,
  onStartSession,
}: HomeHeroSectionProps): React.ReactNode {
  const headline =
    controller.primaryRecommendation?.title ??
    'One clean block. That is the plan.';
  const minutes = controller.todayFocusMinutes;

  return (
    <GlassCard
      flush
      glowMint
      padding={0}
      radius={36}
      style={{ marginBottom: spacing[4], overflow: 'hidden' }}
      variant="hero"
    >
      <View
        pointerEvents="none"
        style={{
          height: 140,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={SCULPTURE}
          style={{
            height: 200,
            opacity: 0.72,
            position: 'absolute',
            right: -36,
            top: -36,
            width: 200,
          }}
        />
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={MASCOT}
          style={{
            bottom: -6,
            height: 120,
            left: 8,
            position: 'absolute',
            width: 100,
          }}
        />
      </View>

        <View
          style={{
            paddingBottom: spacing[6] + spacing[1],
            paddingHorizontal: spacing[6],
            paddingTop: spacing[1],
          }}
        >
          <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingRight: spacing[3] }}>
              <Text
                style={{
                  color: vexLightGlass.semantic.fireDeep,
                  fontSize: 11,
                  fontWeight: '800',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                {homeGreeting()}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 32,
                  fontWeight: '900',
                  letterSpacing: -0.7,
                  lineHeight: 36,
                  marginTop: 4,
                }}
              >
                {headline}
              </Text>
            </View>
            <HomeGoalRing percent={controller.progressPercent} />
          </View>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing[2],
              marginTop: spacing[4],
            }}
          >
          {controller.currentStreak > 0 ? (
            <HomeStatChip
              icon="flame"
              label="day streak"
              tone="fire"
              value={String(controller.currentStreak)}
            />
          ) : null}
          <HomeStatChip
            icon="target"
            label="min today"
            tone="mint"
            value={String(minutes)}
          />
          {controller.currentXp > 0 ? (
            <HomeStatChip
              icon="star"
              label="XP"
              tone="amber"
              value={String(controller.currentXp)}
            />
          ) : null}
        </View>

        <View style={{ marginTop: spacing[6] }}>
          <LiquidButton
            accessibilityHint="Starts a focus session"
            accessibilityLabel="Start focus session"
            fullWidth
            label="Start focus"
            onPress={onStartSession}
            rightIcon={
              <Text
                style={{ color: vexLightGlass.text.inverse, fontSize: 18, fontWeight: '900', letterSpacing: -0.2 }}
              >
                {'→'}
              </Text>
            }
            size="lg"
            variant="primary"
          />
        </View>
      </View>
    </GlassCard>
  );
}
