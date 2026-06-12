import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';
import { etherealButton, etherealText } from '@/theme/tokens/ethereal-sky';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { AnimatedMascot } from './AnimatedMascot';
import { CinematicSignalPill } from './CinematicSignalPill';
import { CINEMATIC_SCENES, FALLBACK_CINEMATIC_SCENE } from './cinematicScenes';

type OnboardingCinematicIntroProps = {
  onBegin: () => void;
};

function getScene(index: number) {
  return CINEMATIC_SCENES[index % CINEMATIC_SCENES.length] ?? FALLBACK_CINEMATIC_SCENE;
}

export function OnboardingCinematicIntro({
  onBegin,
}: OnboardingCinematicIntroProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const pulse = useSharedValue(0);
  const scan = useSharedValue(0);
  const drift = useSharedValue(0);
  const scene = useMemo(() => getScene(sceneIndex), [sceneIndex]);

  useEffect(() => {
    if (isReducedMotion) {
      pulse.value = 0.5;
      scan.value = 0.35;
      drift.value = 0.5;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
    scan.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.cubic) }), -1, true);
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
  }, [drift, isReducedMotion, pulse, scan]);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setSceneIndex((current) => (current + 1) % CINEMATIC_SCENES.length);
    }, 1850);

    return () => clearInterval(timer);
  }, [isReducedMotion]);

  const lensStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.32,
    transform: [{ scale: 0.82 + pulse.value * 0.24 }, { rotate: `${pulse.value * 10}deg` }],
  }));
  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + scan.value * 0.38,
    transform: [{ translateY: -116 + scan.value * 232 }],
  }));
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 + drift.value * 12 }, { scale: 0.99 + pulse.value * 0.02 }],
  }));
  const leftChipStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + pulse.value * 0.2,
    transform: [{ translateX: -10 + drift.value * 16 }, { translateY: 6 - pulse.value * 12 }],
  }));
  const rightChipStyle = useAnimatedStyle(() => ({
    opacity: 0.64 + pulse.value * 0.24,
    transform: [{ translateX: 12 - drift.value * 18 }, { translateY: -2 + pulse.value * 10 }],
  }));

  return (
    <Animated.View
      entering={isReducedMotion ? undefined : FadeIn.duration(360)}
      style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
    >
      <View style={{ alignItems: 'center', minHeight: 430 }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 8,
              width: 332,
              height: 332,
              borderRadius: 166,
              backgroundColor: vexLightGlass.mint[100],
              borderColor: vexLightGlass.glass.border,
              borderWidth: 1,
            },
            lensStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 52,
              width: 282,
              height: 2,
              backgroundColor: vexLightGlass.glass.innerHighlight,
            },
            scanStyle,
          ]}
        />
        <Animated.View entering={isReducedMotion ? undefined : FadeInUp.duration(520)} style={stageStyle}>
          <AnimatedMascot
            isPointing={scene.mood === 'pointing'}
            isSpeaking
            isThinking={scene.mood === 'thinking'}
            mood={scene.mood}
            preferPng
            reactionKey={`cinematic-${sceneIndex}`}
            reducedMotion={isReducedMotion}
            size={{ width: 250, height: 280 }}
          />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', left: 4, top: 80 }, leftChipStyle]}>
          <CinematicSignalPill label={scene.chip} />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', right: 0, top: 196 }, rightChipStyle]}>
          <CinematicSignalPill label="Mascot-led" />
        </Animated.View>
      </View>

      <View style={{ alignItems: 'center', gap: 10 }}>
        <Text fontSize={31} fontWeight="800" style={{ color: etherealText.heading, textAlign: 'center', lineHeight: 36 }}>
          {scene.title}
        </Text>
        <Text fontSize={15} fontWeight="600" style={{ color: etherealText.subtitle, textAlign: 'center', lineHeight: 21 }}>
          {scene.subtitle}
        </Text>
      </View>

      <Pressable
        accessibilityHint="Starts the animated VEX onboarding calibration"
        accessibilityLabel="Begin VEX cinematic onboarding"
        accessibilityRole="button"
        onPress={onBegin}
        style={({ pressed }) => [
          getMinTouchTargetStyle(),
          {
            alignItems: 'center',
            backgroundColor: etherealButton.googleFill,
            borderColor: etherealButton.googleBorder,
            borderRadius: 32,
            borderWidth: 1,
            height: 64,
            justifyContent: 'center',
            marginTop: 28,
            opacity: pressed ? 0.9 : 1,
            width: '100%',
          },
        ]}
      >
        <Text fontSize={17} fontWeight="800" style={{ color: etherealButton.googleText }}>
          Build my first block
        </Text>
      </Pressable>
    </Animated.View>
  );
}
