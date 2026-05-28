import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Svg, Circle, G } from "react-native-svg";

import { Text } from "../../../components/primitives/Text";
import { CompanionState, ELEMENT_THEMES } from "../types";
import { CompanionService } from "../service";
import { getCompanionService } from "../service-instance";
import { CompanionBody } from "./CompanionBody";
import { CompanionParticles } from "./CompanionParticles";
import { getPhaseMultiplier, getMoodEmoji } from "./companion-helpers";
import { COMPANION_SIZE, PARTICLE_COUNT, companionStyles as styles } from "./LivingCompanion.styles";

interface LivingCompanionProps {
  companionState: CompanionState;
  sessionProgress: number;
  purityScore: number;
  elapsedSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  onMilestone?: (milestone: number) => void;
}

export const LivingCompanion: React.FC<LivingCompanionProps> = ({
  companionState,
  sessionProgress,
  purityScore,
  elapsedSeconds,
  totalSeconds,
  isPaused,
  onMilestone,
}) => {
  const serviceRef = useRef<CompanionService | null>(null);
  const progress = useSharedValue(0);
  const energy = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulsePhase = useSharedValue(0);
  const glowIntensity = useSharedValue(0.5);
  const particlePhase = useSharedValue(0);

  useEffect(() => {
    serviceRef.current = getCompanionService(companionState);
    serviceRef.current.startSession(totalSeconds / 60);

    const unsubscribe = serviceRef.current.onEvent((event) => {
      if (
        event.type === "MILESTONE" &&
        event.data.progressDelta &&
        onMilestone
      ) {
        onMilestone(event.data.progressDelta);
      }
      if (event.type === "PURE_FOCUS_BURST") {
        scale.value = withSequence(
          withSpring(1.3, { damping: 10 }),
          withSpring(1, { damping: 15 }),
        );
        glowIntensity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.7, { duration: 1000 }),
        );
      }
      if (event.type === "DANGER_WARN") {
        scale.value = withRepeat(
          withSequence(
            withSpring(0.95, { damping: 5 }),
            withSpring(1.05, { damping: 5 }),
          ),
          3,
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [companionState, glowIntensity, onMilestone, scale, totalSeconds]);

  useEffect(() => {
    if (serviceRef.current && !isPaused) {
      serviceRef.current.tick(
        elapsedSeconds,
        totalSeconds,
        purityScore,
        isPaused,
      );
    }
  }, [elapsedSeconds, isPaused, purityScore, totalSeconds]);

  useEffect(() => {
    progress.value = withSpring(sessionProgress / 100, { damping: 20 });
    energy.value = withSpring(purityScore / 100, { damping: 15 });
  }, [energy, progress, purityScore, sessionProgress]);

  useEffect(() => {
    pulsePhase.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    particlePhase.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [particlePhase, pulsePhase]);

  const theme = ELEMENT_THEMES[companionState.element];
  const phaseMultiplier = getPhaseMultiplier(companionState.phase);

  const companionStyle = useAnimatedStyle(() => {
    const breathing = interpolate(pulsePhase.value, [0, 1], [0.98, 1.02]);
    const energyPulse = interpolate(energy.value, [0, 1], [0.95, 1.1]);
    return {
      transform: [{ scale: scale.value * breathing * energyPulse }],
      opacity: interpolate(energy.value, [0, 0.2], [0.3, 1]),
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0, 1], [0.2, 0.8]),
    transform: [{ scale: interpolate(pulsePhase.value, [0, 1], [1, 1.2]) }],
  }));

  const particleContainerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${particlePhase.value * 360}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glowContainer,
          glowStyle,
          {
            backgroundColor: theme.glow,
            width: COMPANION_SIZE * 1.5,
            height: COMPANION_SIZE * 1.5,
            borderRadius: COMPANION_SIZE * 0.75,
          },
        ]}
      />

      <CompanionParticles
        count={PARTICLE_COUNT}
        companionSize={COMPANION_SIZE}
        theme={theme}
        particleContainerStyle={particleContainerStyle}
      />

      <Animated.View style={[styles.companionContainer, companionStyle]}>
        <Svg width={COMPANION_SIZE} height={COMPANION_SIZE}>
          <G>
            <CompanionBody
              phase={companionState.phase}
              theme={theme}
              size={COMPANION_SIZE}
            />
            <Circle
              cx={COMPANION_SIZE / 2}
              cy={COMPANION_SIZE / 2}
              r={COMPANION_SIZE * 0.15 * phaseMultiplier}
              fill={theme.primary}
              opacity={0.9}
            />
          </G>
        </Svg>
      </Animated.View>

      <View style={styles.statusContainer}>
        <Text
          variant="bodySmall"
          style={[styles.moodText, { color: theme.primary }]}
        >
          {getMoodEmoji(companionState.currentMood)}{" "}
          {companionState.currentMood}
        </Text>
        <Text variant="caption" style={styles.phaseText}>
          {companionState.phase} Level {companionState.level}
        </Text>
      </View>
    </View>
  );
};

export { COMPANION_SIZE, PARTICLE_COUNT, companionStyles } from "./LivingCompanion.styles";
