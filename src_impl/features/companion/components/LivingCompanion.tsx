/**
 * Living Companion Visual Component
 *
 * A living, breathing entity that evolves in real-time during focus sessions.
 * Uses particle systems, morphing shapes, and ambient animations to create
 * emotional connection and immediate feedback.
 */

import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence, interpolate, Easing, runOnJS, useAnimatedReaction, type SharedValue } from "react-native-reanimated";
import { Svg, Circle, RadialGradient, Stop, G } from "react-native-svg";

import { Text } from "../../../components/primitives/Text";
import { CompanionState, CompanionPhase, CompanionMood, CompanionElement, ELEMENT_THEMES } from "../types";
import { getCompanionService, CompanionService } from "../service";
import { createSheet } from "@/shared/ui/create-sheet";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COMPANION_SIZE = Math.min(SCREEN_WIDTH * 0.6, 300);
const PARTICLE_COUNT = 12;

interface LivingCompanionProps {
  companionState: CompanionState;
  sessionProgress: number; // 0-100
  purityScore: number; // 0-100
  elapsedSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  onMilestone?: (milestone: number) => void;
}

export const LivingCompanion: React.FC<LivingCompanionProps> = ({ companionState, sessionProgress, purityScore, elapsedSeconds, totalSeconds, isPaused, onMilestone }) => {
  const serviceRef = useRef<CompanionService | null>(null);

  // Animated values for smooth transitions
  const progress = useSharedValue(0);
  const energy = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulsePhase = useSharedValue(0);
  const glowIntensity = useSharedValue(0.5);
  const particlePhase = useSharedValue(0);
  const moodTransition = useSharedValue(0);

  // Initialize service
  useEffect(() => {
    serviceRef.current = getCompanionService(companionState);
    serviceRef.current.startSession(totalSeconds / 60);

    const unsubscribe = serviceRef.current.onEvent((event) => {
      if (event.type === "MILESTONE" && event.data.progressDelta && onMilestone) {
        onMilestone(event.data.progressDelta);
      }

      if (event.type === "PURE_FOCUS_BURST") {
        // Trigger burst animation
        scale.value = withSequence(withSpring(1.3, { damping: 10 }), withSpring(1, { damping: 15 }));
        glowIntensity.value = withSequence(withTiming(1, { duration: 200 }), withTiming(0.7, { duration: 1000 }));
      }

      if (event.type === "DANGER_WARN") {
        scale.value = withRepeat(withSequence(withSpring(0.95, { damping: 5 }), withSpring(1.05, { damping: 5 })), 3);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update service on each tick
  useEffect(() => {
    if (serviceRef.current && !isPaused) {
      serviceRef.current.tick(elapsedSeconds, totalSeconds, purityScore, isPaused);
    }
  }, [elapsedSeconds, purityScore, isPaused]);

  // Animate progress smoothly
  useEffect(() => {
    progress.value = withSpring(sessionProgress / 100, { damping: 20 });
    energy.value = withSpring(purityScore / 100, { damping: 15 });
  }, [sessionProgress, purityScore]);

  // Continuous animations
  useEffect(() => {
    // Breathing animation
    pulsePhase.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);

    // Particle rotation
    particlePhase.value = withRepeat(withTiming(1, { duration: 10000, easing: Easing.linear }), -1, false);
  }, []);

  // Calculate derived values
  const theme = ELEMENT_THEMES[companionState.element];
  const phaseMultiplier = getPhaseMultiplier(companionState.phase);

  // Animated styles
  const companionStyle = useAnimatedStyle(() => {
    const breathing = interpolate(pulsePhase.value, [0, 1], [0.98, 1.02]);
    const energyPulse = interpolate(energy.value, [0, 1], [0.95, 1.1]);

    return {
      transform: [{ scale: scale.value * breathing * energyPulse }],
      opacity: interpolate(energy.value, [0, 0.2], [0.3, 1]),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowIntensity.value, [0, 1], [0.2, 0.8]),
      transform: [{ scale: interpolate(pulsePhase.value, [0, 1], [1, 1.2]) }],
    };
  });

  const particleContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${particlePhase.value * 360}deg` }],
    };
  });

  const renderParticle = useCallback(
    (index: number) => {
      const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
      const distance = COMPANION_SIZE * 0.6 + (index % 3) * 20;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 4 + (index % 4) * 2;

      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              backgroundColor: theme.particle,
              left: COMPANION_SIZE / 2 + x - size / 2,
              top: COMPANION_SIZE / 2 + y - size / 2,
              opacity: 0.6 + (index % 3) * 0.15,
            },
          ]}
        />
      );
    },
    [theme],
  );

  return (
    <View style={styles.container}>
      {/* Ambient glow background */}
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

      {/* Particle orbit */}
      <Animated.View style={[styles.particleOrbit, particleContainerStyle]}>{Array.from({ length: PARTICLE_COUNT }, (_, i) => renderParticle(i))}</Animated.View>

      {/* Main companion form */}
      <Animated.View style={[styles.companionContainer, companionStyle]}>
        <Svg width={COMPANION_SIZE} height={COMPANION_SIZE}>
          <G>
            {/* Core body - morphs based on phase */}
            <CompanionBody phase={companionState.phase} progress={progress} energy={energy} theme={theme} size={COMPANION_SIZE} />

            {/* Inner light */}
            <Circle cx={COMPANION_SIZE / 2} cy={COMPANION_SIZE / 2} r={COMPANION_SIZE * 0.15 * phaseMultiplier} fill={theme.primary} opacity={0.9} />
          </G>
        </Svg>
      </Animated.View>

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Text variant="bodySmall" style={[styles.moodText, { color: theme.primary }]}>
          {getMoodEmoji(companionState.currentMood)} {companionState.currentMood}
        </Text>
        <Text variant="caption" style={styles.phaseText}>
          {companionState.phase} Level {companionState.level}
        </Text>
      </View>
    </View>
  );
};

/**
 * Companion body shape - morphs based on evolution phase
 */
const CompanionBody: React.FC<{
  phase: CompanionPhase;
  progress: SharedValue<number>;
  energy: SharedValue<number>;
  theme: { primary: string; secondary: string; glow: string };
  size: number;
}> = ({ phase, theme, size }) => {
  const radius = size * 0.4;
  const center = size / 2;

  // Different shapes for different phases
  const renderPhaseShape = () => {
    switch (phase) {
      case "EGG":
        // Simple egg shape
        return (
          <>
            <RadialGradient id="eggGradient" cx={center} cy={center} rx={radius} ry={radius * 1.2}>
              <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.3" />
            </RadialGradient>
            <Circle cx={center} cy={center} r={radius} fill="url(#eggGradient)" />
          </>
        );

      case "HATCHING":
        // Cracked egg with emerging form
        return (
          <>
            <RadialGradient id="hatchGradient" cx={center} cy={center} rx={radius} ry={radius}>
              <Stop offset="0%" stopColor={theme.glow} stopOpacity="0.9" />
              <Stop offset="60%" stopColor={theme.primary} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.2" />
            </RadialGradient>
            <Circle cx={center} cy={center} r={radius} fill="url(#hatchGradient)" />
            {/* Crack lines */}
            <Circle cx={center - radius * 0.3} cy={center - radius * 0.2} r={2} fill={theme.primary} />
            <Circle cx={center + radius * 0.2} cy={center + radius * 0.3} r={1.5} fill={theme.primary} />
          </>
        );

      case "YOUNG":
        // Small creature form
        return (
          <>
            <RadialGradient id="youngGradient" cx={center} cy={center} rx={radius * 0.8} ry={radius * 0.8}>
              <Stop offset="0%" stopColor={theme.glow} stopOpacity="1" />
              <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.4" />
            </RadialGradient>
            <Circle cx={center} cy={center} r={radius * 0.8} fill="url(#youngGradient)" />
            {/* Eyes */}
            <Circle cx={center - 8} cy={center - 5} r={3} fill="#FFF" opacity={0.9} />
            <Circle cx={center + 8} cy={center - 5} r={3} fill="#FFF" opacity={0.9} />
          </>
        );

      case "MATURE":
      case "AWAKENED":
      case "TRANSCENDENT":
        // Full form with complex aura
        return (
          <>
            <RadialGradient id="matureGradient" cx={center} cy={center} rx={radius} ry={radius}>
              <Stop offset="0%" stopColor={theme.glow} stopOpacity="1" />
              <Stop offset="30%" stopColor={theme.primary} stopOpacity="0.8" />
              <Stop offset="70%" stopColor={theme.secondary} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.1" />
            </RadialGradient>
            <Circle cx={center} cy={center} r={radius} fill="url(#matureGradient)" />
            {/* Crown/horns for higher phases */}
            {phase !== "MATURE" && (
              <>
                <Circle cx={center - radius * 0.5} cy={center - radius * 0.3} r={4} fill={theme.glow} />
                <Circle cx={center + radius * 0.5} cy={center - radius * 0.3} r={4} fill={theme.glow} />
              </>
            )}
          </>
        );
    }
  };

  return renderPhaseShape();
};

function getPhaseMultiplier(phase: CompanionPhase): number {
  const multipliers: Record<CompanionPhase, number> = {
    EGG: 0.5,
    HATCHING: 0.7,
    YOUNG: 0.85,
    MATURE: 1,
    AWAKENED: 1.2,
    TRANSCENDENT: 1.5,
  };
  return multipliers[phase];
}

function getMoodEmoji(mood: CompanionMood): string {
  const emojis: Record<CompanionMood, string> = {
    SLEEPY: "😴",
    CONTENT: "😊",
    FOCUSED: "🎯",
    DETERMINED: "🔥",
    ECSTATIC: "✨",
    STRUGGLING: "😰",
    DANGER: "⚠️",
  };
  return emojis[mood];
}

const styles = createSheet({
  container: {
    width: COMPANION_SIZE,
    height: COMPANION_SIZE + 60,
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    position: "absolute",
    opacity: 0.3,
  },
  particleOrbit: {
    position: "absolute",
    width: COMPANION_SIZE,
    height: COMPANION_SIZE,
  },
  particle: {
    position: "absolute",
    borderRadius: 100,
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  companionContainer: {
    zIndex: 10,
  },
  statusContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  moodText: {
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  phaseText: {
    opacity: 0.6,
    marginTop: 4,
  },
});
