import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets, timingPresets } from '../../../theme/tokens/motion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens/spacing';
import { triggerHaptic } from '../../../utils/haptics';
import type { UnlockDecision } from '../../unlock-explainer/types';
import { EvidenceRow } from './EvidenceRow';
import { CelebrationHeader } from './CelebrationHeader';
import { UnlockIconBurst } from './UnlockIconBurst';
import { GlowParticle } from './GlowParticle';
import { GLOW_COLORS, GLOW_PARTICLES } from './feature-unlock-helpers';

const CARD_WIDTH_OFFSET = 48;
const CARD_MAX_WIDTH = 380;

interface CelebrationOverlayProps {
  featureColor: string;
  featureIcon: string;
  featureName: string;
  featureDescription: string;
  decision: UnlockDecision;
  onDismiss: () => void;
}

export function CelebrationOverlay({
  featureColor,
  featureIcon,
  featureName,
  featureDescription,
  decision,
  onDismiss,
}: CelebrationOverlayProps): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [showEvidence, setShowEvidence] = useState(false);

  const cardTranslateY = useSharedValue(isReducedMotion ? 0 : 120);
  const cardOpacity = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {return;}
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
  }, [isReducedMotion, cardTranslateY, cardOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const handleDismiss = useCallback(() => {
    triggerHaptic('impactLight');
    onDismiss();
  }, [onDismiss]);

  const toggleLabel = showEvidence ? 'Hide details' : 'Why am I seeing this?';

  return (
    <Animated.View style={[{ width: SCREEN_WIDTH - CARD_WIDTH_OFFSET, maxWidth: CARD_MAX_WIDTH }, cardStyle]}>
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
        <View style={{ alignItems: 'center', gap: spacing[3], zIndex: 2 }}>
          <CelebrationHeader
            featureColor={featureColor}
            featureName={featureName}
            featureDescription={featureDescription}
          />

          <View
            style={{
              backgroundColor: vexLightGlass.background.atmosphericMint,
              borderRadius: 16,
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
accessibilityHint="Shows or hides evidence for this celebration"
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
                {toggleLabel}
              </Text>
            </Pressable>
          )}

          {showEvidence && decision.evidence.length > 0 && (
            <View
              style={{
                backgroundColor: vexLightGlass.background.atmosphericPearl,
                borderRadius: 16,
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
  );
}
