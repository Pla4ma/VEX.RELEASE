import React, { useEffect, useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { timingPresets } from '../../../theme/tokens/motion';
import { featureUnlocked } from '../../../utils/haptics';
import { createUnlockDecision } from '../../unlock-explainer/service';
import { CelebrationOverlay } from './CelebrationOverlay';
import { findGate, resolveFeatureDisplay } from './feature-unlock-helpers';

interface FeatureUnlockCelebrationProps {
  featureKey: string;
  onDismiss: () => void;
}

export function FeatureUnlockCelebration({
  featureKey,
  onDismiss,
}: FeatureUnlockCelebrationProps): JSX.Element | null {
  const { isReducedMotion } = useReducedMotion();
  const overlayOpacity = useSharedValue(isReducedMotion ? 1 : 0);

  const gate = useMemo(() => findGate(featureKey), [featureKey]);
  const display = useMemo(
    () => resolveFeatureDisplay(featureKey, gate),
    [featureKey, gate],
  );

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
  }, [isReducedMotion, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

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
        onPress={onDismiss}
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

      <CelebrationOverlay
        featureColor={display.color}
        featureIcon={display.icon}
        featureName={display.name}
        featureDescription={display.description}
        decision={decision}
        onDismiss={onDismiss}
      />
    </Animated.View>
  );
}
