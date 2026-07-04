import React from 'react';
import Animated from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import type { CompanionPhase } from '../types';
import { PHASE_NAMES } from './companion-evolution-types';
import type { EvolutionPhase, ElementThemeColors } from './companion-evolution-types';

export const ParticleLayer: React.ComponentType<{
  particleStyle: AnimatedStyle;
  themeColors: ElementThemeColors;
}> = ({ particleStyle, themeColors }) => (
  <Animated.View
    style={[
      { position: 'absolute', width: 300, height: 300 },
      particleStyle,
    ]}
    pointerEvents="none"
  >
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 100;
      return (
        <Box
          key={`item-${i}`}
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
);

export const CelebrationLayer: React.ComponentType<{
  textStyle: AnimatedStyle;
  themeColors: ElementThemeColors;
  newPhase: CompanionPhase;
  totalFocusMinutes: number;
}> = ({ textStyle, themeColors, newPhase, totalFocusMinutes }) => (
  <Animated.View
    style={[
      textStyle,
      { position: 'absolute', bottom: 120, zIndex: 30 },
    ]}
  >
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
      <Text
        variant="body"
        color="text.secondary"
        textAlign="center"
        mt="xs"
      >
        Your companion has grown through{' '}
        {Math.floor(totalFocusMinutes)} minutes of focused
        time together.
      </Text>
    </Box>
  </Animated.View>
);

export const PhaseIndicators: React.ComponentType<{
  ceremonyPhase: EvolutionPhase;
  themeColors: ElementThemeColors;
}> = ({ ceremonyPhase, themeColors }) => (
  <Box
    position="absolute"
    bottom={80}
    flexDirection="row"
    gap="sm"
    zIndex={35}
  >
    {(
      [
        'energy-buildup',
        'flash',
        'transformation',
        'celebration',
      ] as EvolutionPhase[]
    ).map((phase) => {
      const isActive =
        ceremonyPhase === phase ||
        (ceremonyPhase === 'complete' && phase === 'celebration');
      const isPast =
        ceremonyPhase !== 'complete' &&
        ['transformation', 'celebration', 'complete'].includes(
          ceremonyPhase,
        ) &&
        ['energy-buildup', 'flash'].includes(phase);
      return (
        <Box
          key={phase}
          width={8}
          height={8}
          borderRadius="full"
          bg={
            isActive
              ? themeColors.primary
              : isPast
                ? themeColors.glow
                : 'background.tertiary'
          }
          style={{ opacity: isActive || isPast ? 1 : 0.4 }}
        />
      );
    })}
  </Box>
);
