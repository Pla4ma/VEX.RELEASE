import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets, timingPresets } from '../../../theme/tokens/motion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing, borderRadius } from '../../../theme/tokens';
import { triggerHaptic, featureUnlocked } from '../../../utils/haptics';
import { FEATURE_UNLOCK_GATES } from '../../onboarding/onboarding-gates';
import { createUnlockDecision } from '../../unlock-explainer/service';
import type { FeatureUnlockGate } from '../../onboarding/onboarding-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeatureUnlockCelebrationProps {
  featureKey: string;
  onDismiss: () => void;
}

const GLOW_PARTICLES = 5;
const GLOW_COLORS = [
  vexLightGlass.mint[300],
  vexLightGlass.mint[200],
  vexLightGlass.semantic.success,
  vexLightGlass.background.atmosphericMint,
  'rgba(255, 255, 255, 0.8)',
];

function findGate(featureKey: string): FeatureUnlockGate | undefined {
  return FEATURE_UNLOCK_GATES.find((g) => g.featureId === featureKey);
}

function mapLiveopsFeatureName(featureKey: string): string {
  const names: Record<string, string> = {
    companion_detail: 'Companion Detail',
    challenges: 'Challenges',
    boss_tab: 'Boss Encounters',
    ai_coach_advanced: 'AI Coach Advanced',
    content_study: 'Study Mode',
    content_study_advanced: 'Advanced Study',
    memory_console: 'Memory Console',
    economy_basic: 'Progress Economy',
    quiz_review_mode: 'Quiz Review',
    achievements: 'Achievements',
    advanced_settings: 'Advanced Settings',
    premium_paywall: 'Premium',
  };
  return names[featureKey] ?? featureKey.replace(/_/g, ' ');
}

function GlowParticle({
  color,
  index,
}: {
  color: string;
  index: number;
}): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const size = 6 + (index % 3) * 3;
  const angle = (index * 72 + 15) * (Math.PI / 180);
  const distance = 40 + index * 12;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance;

  const particleX = useSharedValue(0);
  const particleY = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const particleScale = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      particleOpacity.value = 0;
      return;
    }
    particleOpacity.value = withDelay(
      200 + index * 120,
      withSequence(
        withTiming(0.9, {
          duration: timingPresets.enter.duration,
          easing: Easing.bezier(...timingPresets.enter.easing),
        }),
        withTiming(0, {
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ),
    );
    particleX.value = withDelay(
      200 + index * 100,
      withTiming(tx, {
        duration: 2000,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      }),
    );
    particleY.value = withDelay(
      200 + index * 100,
      withTiming(ty - 20, {
        duration: 2000,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
    );
    particleScale.value = withDelay(
      200 + index * 120,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 1400 }),
      ),
    );
  }, [isReducedMotion, particleOpacity, particleX, particleY, particleScale, index, tx, ty]);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
    transform: [
      { translateX: particleX.value },
      { translateY: particleY.value },
      { scale: particleScale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: color,
          borderRadius: borderRadius.full,
          height: size,
          position: 'absolute',
          width: size,
        },
        particleStyle,
      ]}
    />
  );
}

function UnlockIconBurst({
  icon,
  color,
}: {
  icon: string;
  color: string;
}): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      burstScale.value = 1;
      burstOpacity.value = 1;
      return;
    }
    burstScale.value = withSpring(1, {
      damping: springPresets.lively.damping,
      stiffness: springPresets.lively.stiffness,
      mass: springPresets.lively.mass,
    });
    burstOpacity.value = withTiming(1, {
      duration: timingPresets.enter.duration,
      easing: Easing.bezier(...timingPresets.enter.easing),
    });
  }, [isReducedMotion, burstScale, burstOpacity]);

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          },
          burstStyle,
        ]}
      >
        <View
          style={{
            backgroundColor: `${color}22`,
            borderRadius: 999,
            height: 120,
            width: 120,
          }}
        />
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(150).duration(400)}
        style={{
          alignItems: 'center',
          backgroundColor: `${color}18`,
          borderColor: `${color}44`,
          borderRadius: borderRadius.full,
          borderWidth: 2,
          height: 88,
          justifyContent: 'center',
          width: 88,
        }}
      >
        <Text style={{ fontSize: 40 }}>{icon}</Text>
      </Animated.View>
    </View>
  );
}

function EvidenceRow({
  label,
  emoji,
  index,
}: {
  label: string;
  emoji: string;
  index: number;
}): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion ? undefined : FadeIn.delay(200 + index * 80).duration(300);

  return (
    <Animated.View
      entering={entering}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing[2],
        paddingVertical: spacing[1],
      }}
    >
      <Text style={{ fontSize: 13 }}>{emoji}</Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          flex: 1,
          lineHeight: 17,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export function FeatureUnlockCelebration({
  featureKey,
  onDismiss,
}: FeatureUnlockCelebrationProps): JSX.Element | null {
  const { isReducedMotion } = useReducedMotion();
  const [showEvidence, setShowEvidence] = useState(false);

  const cardTranslateY = useSharedValue(isReducedMotion ? 0 : 120);
  const cardOpacity = useSharedValue(isReducedMotion ? 1 : 0);
  const overlayOpacity = useSharedValue(isReducedMotion ? 1 : 0);

  const gate = useMemo(() => findGate(featureKey), [featureKey]);
  const featureName = gate?.featureName ?? mapLiveopsFeatureName(featureKey);
  const featureColor = gate?.color ?? vexLightGlass.mint[500];
  const featureIcon = gate?.icon ?? '🔓';
  const featureDescription =
    gate?.description ?? 'A new layer has opened.';

  const decision = useMemo(
    () =>
      createUnlockDecision({
        featureKey,
        sessionCount: 1,
        isPremium: false,
        hasRelatedBehavior: false,
      }),
    [featureKey],
  );

  useEffect(() => {
    void featureUnlocked();
    if (isReducedMotion) {return;}
    overlayOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.bezier(...timingPresets.microFade.easing),
    });
    cardTranslateY.value = withDelay(
      180,
      withSpring(0, {
        damping: springPresets.settle.damping,
        stiffness: springPresets.settle.stiffness,
        mass: springPresets.settle.mass,
      }),
    );
    cardOpacity.value = withTiming(1, {
      duration: timingPresets.cinematicReveal.duration,
      easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
    });
  }, [isReducedMotion, overlayOpacity, cardTranslateY, cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    triggerHaptic('impactLight');
    onDismiss();
  }, [onDismiss]);

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          backgroundColor: 'rgba(10, 53, 43, 0.62)',
          bottom: 0,
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 1000,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        onPress={handleDismiss}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        accessibilityLabel="Dismiss feature unlock announcement"
        accessibilityRole="button"
      />

      <Animated.View style={[{ width: SCREEN_WIDTH - 48, maxWidth: 380 }, cardStyle]}>
        <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
          <UnlockIconBurst icon={featureIcon} color={featureColor} />

          {Array.from({ length: GLOW_PARTICLES }).map((_, i) => (
            <GlowParticle
              key={`glow-${i}`}
              color={GLOW_COLORS[i % GLOW_COLORS.length]!}
              index={i}
            />
          ))}
        </View>

        <GlassCard variant="hero" glowMint padding={24} radius={28}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              `${vexLightGlass.mint[400]}08`,
              'rgba(255, 255, 255, 0)',
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: borderRadius.xl,
              bottom: 0,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          />

          <View style={{ alignItems: 'center', gap: spacing[3], zIndex: 2 }}>
            <View
              style={{
                backgroundColor: `${featureColor}22`,
                borderColor: `${featureColor}55`,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1],
              }}
            >
              <Text
                style={{
                  color: featureColor,
                  fontSize: 9,
                  fontWeight: '900',
                  letterSpacing: 2,
                }}
              >
                NEW FEATURE UNLOCKED
              </Text>
            </View>

            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 26,
                fontWeight: '900',
                letterSpacing: -0.5,
                textAlign: 'center',
              }}
            >
              {featureName}
            </Text>

            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 14,
                lineHeight: 20,
                textAlign: 'center',
              }}
            >
              {featureDescription}
            </Text>

            <View
              style={{
                backgroundColor: vexLightGlass.background.atmosphericMint,
                borderRadius: borderRadius.xl,
                padding: spacing[3],
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.text.onMint,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {decision.userFacingReason}
              </Text>
            </View>

            {decision.evidence.length > 0 && (
              <Pressable
                onPress={() => setShowEvidence((v) => !v)}
                accessibilityLabel="Why am I seeing this"
                accessibilityRole="button"
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: spacing[1],
                  width: '100%',
                }}
              >
                <Icon
                  color={vexLightGlass.mint[500]}
                  name={showEvidence ? 'chevronDown' : 'chevronRight'}
                  size="xs"
                />
                <Text
                  style={{
                    color: vexLightGlass.mint[500],
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {showEvidence ? 'Hide details' : 'Why am I seeing this?'}
                </Text>
              </Pressable>
            )}

            {showEvidence && decision.evidence.length > 0 && (
              <View
                style={{
                  backgroundColor: vexLightGlass.background.atmosphericPearl,
                  borderRadius: borderRadius.xl,
                  borderColor: vexLightGlass.glass.borderSubtle,
                  borderWidth: 1,
                  padding: spacing[3],
                  width: '100%',
                }}
              >
                {decision.evidence.map((item, i) => (
                  <EvidenceRow
                    key={`${item.source}-${i}`}
                    label={`${item.source}: ${item.detail}`}
                    index={i}
                    emoji="⋮"
                  />
                ))}
              </View>
            )}

            <LiquidButton
              label="Got it"
              variant="primary"
              size="md"
              fullWidth
              onPress={handleDismiss}
              accessibilityHint="Dismisses the unlock celebration"
              accessibilityLabel="Got it — dismiss feature unlock"
            />
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
}

export default FeatureUnlockCelebration;
