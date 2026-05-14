/**
 * CompanionEvolutionCeremony
 *
 * PHASE 13.2 - Full-screen ceremony for companion evolution
 * 4-phase animated ceremony when companion reaches next evolution phase
 *
 * @phase 13.2
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, interpolate, Easing, runOnJS } from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { CompanionState, CompanionPhase } from '../types';
import { ELEMENT_THEMES, EVOLUTION_THRESHOLDS } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type EvolutionPhase = 'energy-buildup' | 'flash' | 'transformation' | 'celebration' | 'complete';

interface CompanionEvolutionCeremonyProps {
  /** Companion state BEFORE evolution */
  previousState: CompanionState;
  /** New phase after evolution */
  newPhase: CompanionPhase;
  /** Called when ceremony completes */
  onComplete: () => void;
}

// Phase display names
const PHASE_NAMES: Record<CompanionPhase, string> = {
  EGG: 'Egg',
  HATCHING: 'Hatching',
  YOUNG: 'Young',
  MATURE: 'Mature',
  AWAKENED: 'Awakened',
  TRANSCENDENT: 'Transcendent',
};

// Phase emojis
const PHASE_EMOJIS: Record<CompanionPhase, string> = {
  EGG: '🥚',
  HATCHING: '🐣',
  YOUNG: '🐤',
  MATURE: '🦅',
  AWAKENED: '🐉',
  TRANSCENDENT: '🌟',
};

export const CompanionEvolutionCeremony: React.FC<CompanionEvolutionCeremonyProps> = ({ previousState, newPhase, onComplete }) => {
  const { theme } = useTheme();
  const [ceremonyPhase, setCeremonyPhase] = useState<EvolutionPhase>('energy-buildup');

  // Animation values
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const oldFormOpacity = useSharedValue(1);
  const oldFormScale = useSharedValue(1);
  const newFormOpacity = useSharedValue(0);
  const newFormScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  const particleBurst = useSharedValue(0);

  const themeColors = ELEMENT_THEMES[previousState.element];

  const runCeremony = useCallback(async () => {
    // Phase 1: Energy Buildup (1 second)
    setCeremonyPhase('energy-buildup');
    glowOpacity.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) });
    glowScale.value = withTiming(2, { duration: 1000, easing: Easing.inOut(Easing.sin) });

    await delay(1000);

    // Phase 2: Flash (0.5 seconds)
    setCeremonyPhase('flash');
    flashOpacity.value = withTiming(1, { duration: 250 });
    oldFormOpacity.value = withTiming(0, { duration: 250 });

    await delay(250);

    flashOpacity.value = withTiming(0, { duration: 250 });

    await delay(250);

    // Phase 3: Transformation (2 seconds)
    setCeremonyPhase('transformation');
    newFormOpacity.value = withTiming(1, { duration: 1000 });
    newFormScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    particleBurst.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });

    await delay(2000);

    // Phase 4: Celebration (1 second)
    setCeremonyPhase('celebration');
    textOpacity.value = withTiming(1, { duration: 500 });
    textScale.value = withSpring(1, { damping: 10, stiffness: 200 });

    await delay(1000);

    // Complete
    setCeremonyPhase('complete');
  }, [flashOpacity, glowOpacity, glowScale, newFormOpacity, newFormScale, oldFormOpacity, particleBurst, textOpacity, textScale]);

  // Run ceremony sequence
  useEffect(() => {
    runCeremony();
  }, [runCeremony]);

  const handleTap = () => {
    if (ceremonyPhase === 'complete') {
      onComplete();
    }
  };

  // Animated styles
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const oldFormStyle = useAnimatedStyle(() => ({
    opacity: oldFormOpacity.value,
    transform: [{ scale: oldFormScale.value }],
  }));

  const newFormStyle = useAnimatedStyle(() => ({
    opacity: newFormOpacity.value,
    transform: [{ scale: newFormScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(particleBurst.value, [0, 0.3, 1], [1, 1, 0]),
    transform: [{ scale: interpolate(particleBurst.value, [0, 1], [0.5, 3]) }, { rotate: `${particleBurst.value * 360}deg` }],
  }));

  return (
    <Pressable onPress={handleTap} style={{ flex: 1 }} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box flex={1} alignItems="center" justifyContent="center" bg={theme.colors.background.primary} style={{ position: 'relative' }}>
        {/* Ambient glow background */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              backgroundColor: `${themeColors.glow}30`,
            },
            glowStyle,
          ]}
          pointerEvents="none"
        />

        {/* Energy orb glow */}
        {(ceremonyPhase === 'energy-buildup' || ceremonyPhase === 'flash') && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: themeColors.glow,
              },
              glowStyle,
            ]}
            pointerEvents="none"
          />
        )}

        {/* White flash overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 50,
            },
            flashStyle,
          ]}
          pointerEvents="none"
        />

        {/* Old form (fading out) */}
        {(ceremonyPhase === 'energy-buildup' || ceremonyPhase === 'flash') && (
          <Animated.View style={[oldFormStyle, { position: 'absolute', zIndex: 10 }]}>
            <Box alignItems="center">
              <Box
                width={160}
                height={160}
                borderRadius={80}
                bg={`${themeColors.primary}40`}
                justifyContent="center"
                alignItems="center"
                style={{
                  borderWidth: 4,
                  borderColor: themeColors.primary,
                  shadowColor: themeColors.glow,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                }}
              >
                <Text fontSize={72}>{PHASE_EMOJIS[previousState.phase]}</Text>
              </Box>
              <Text variant="h3" color={themeColors.primary} mt={4}>
                {PHASE_NAMES[previousState.phase]}
              </Text>
            </Box>
          </Animated.View>
        )}

        {/* New form (appearing) */}
        {(ceremonyPhase === 'transformation' || ceremonyPhase === 'celebration' || ceremonyPhase === 'complete') && (
          <Animated.View style={[newFormStyle, { position: 'absolute', zIndex: 20 }]}>
            <Box alignItems="center">
              <Box
                width={180}
                height={180}
                borderRadius={90}
                bg={`${themeColors.primary}50`}
                justifyContent="center"
                alignItems="center"
                style={{
                  borderWidth: 6,
                  borderColor: themeColors.glow,
                  shadowColor: themeColors.glow,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 30,
                }}
              >
                <Text fontSize={80}>{PHASE_EMOJIS[newPhase]}</Text>
              </Box>
            </Box>
          </Animated.View>
        )}

        {/* Particle burst effect */}
        {ceremonyPhase === 'transformation' && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 300,
                height: 300,
              },
              particleStyle,
            ]}
            pointerEvents="none"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = 100;
              return (
                <Box
                  key={i}
                  position="absolute"
                  width={8}
                  height={8}
                  borderRadius="full"
                  bg={themeColors.particle}
                  style={{
                    left: 150 + Math.cos(angle) * distance - 4,
                    top: 150 + Math.sin(angle) * distance - 4,
                  }}
                />
              );
            })}
          </Animated.View>
        )}

        {/* Celebration text */}
        {(ceremonyPhase === 'celebration' || ceremonyPhase === 'complete') && (
          <Animated.View style={[textStyle, { position: 'absolute', bottom: 120, zIndex: 30 }]}>
            <Box alignItems="center" gap="sm">
              <Text
                variant="hero"
                style={{
                  fontSize: 48,
                  color: themeColors.glow,
                  textShadowColor: themeColors.primary,
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 10,
                }}
              >
                EVOLVED!
              </Text>
              <Text variant="h3" color={themeColors.primary}>
                {PHASE_NAMES[newPhase]} Form Unlocked
              </Text>
              <Text variant="body" color="text.secondary" textAlign="center" mt="xs">
                Your companion has grown through {Math.floor(previousState.totalFocusMinutes)} minutes of focused time together.
              </Text>
            </Box>
          </Animated.View>
        )}

        {/* Tap to continue hint */}
        {ceremonyPhase === 'complete' && (
          <Box position="absolute" bottom={40} alignItems="center" zIndex={40}>
            <Text variant="caption" color="text.tertiary">
              Tap anywhere to continue
            </Text>
          </Box>
        )}

        {/* Phase indicator dots at bottom */}
        <Box position="absolute" bottom={80} flexDirection="row" gap="sm" zIndex={35}>
          {(["energy-buildup", "flash", "transformation", "celebration"] as EvolutionPhase[]).map((phase, _index) => {
            const isActive = ceremonyPhase === phase || (ceremonyPhase === "complete" && phase === "celebration");
            const isPast = ceremonyPhase !== "complete" && ["transformation", "celebration", "complete"].includes(ceremonyPhase) && ["energy-buildup", "flash"].includes(phase);

            return <Box key={phase} width={8} height={8} borderRadius="full" bg={isActive ? themeColors.primary : isPast ? themeColors.glow : 'background.tertiary'} style={{ opacity: isActive || isPast ? 1 : 0.4 }} />;
          })}
        </Box>
      </Box>
    </Pressable>
  );
};

// Utility function for delays
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default CompanionEvolutionCeremony;
