import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getElementThemeColors } from './companion-evolution-types';
import type { EvolutionPhase, CompanionEvolutionCeremonyProps } from './companion-evolution-types';
import { useCeremonyAnimation } from './companion-evolution-hooks';
import { companionEvolution } from '../../../utils/haptics';
import {
  GlowLayer,
  FlashLayer,
  OldFormLayer,
  NewFormLayer,
} from './companion-evolution-layers';
import {
  ParticleLayer,
  CelebrationLayer,
  PhaseIndicators,
} from './companion-evolution-effects';

export const CompanionEvolutionCeremony: React.ComponentType<
  CompanionEvolutionCeremonyProps
> = ({ previousState, newPhase, onComplete }) => {
  const { theme } = useTheme();
  const [ceremonyPhase, setCeremonyPhase] =
    useState<EvolutionPhase>('energy-buildup');

  const { runCeremony, styles } = useCeremonyAnimation();
  const themeColors = getElementThemeColors(previousState.element);

  useEffect(() => {
    runCeremony(setCeremonyPhase);
  }, [runCeremony, setCeremonyPhase]);

  const handleTap = () => {
    if (ceremonyPhase === 'complete') {
      companionEvolution();
      onComplete();
    }
  };

  return (
    <Pressable
      onPress={handleTap}
      style={{ flex: 1 }}
      accessibilityLabel="Dismiss companion evolution ceremony"
      accessibilityRole="button"
      accessibilityHint="Double tap to continue"
    >
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg={theme.colors.background.primary}
        style={{ position: 'relative' }}
      >
        <GlowLayer
          glowStyle={styles.glowStyle}
          themeColors={themeColors}
          ceremonyPhase={ceremonyPhase}
        />
        <FlashLayer flashStyle={styles.flashStyle} />

        {(ceremonyPhase === 'energy-buildup' || ceremonyPhase === 'flash') && (
          <OldFormLayer
            oldFormStyle={styles.oldFormStyle}
            themeColors={themeColors}
            previousPhase={previousState.phase}
          />
        )}

        {(ceremonyPhase === 'transformation' ||
          ceremonyPhase === 'celebration' ||
          ceremonyPhase === 'complete') && (
          <NewFormLayer
            newFormStyle={styles.newFormStyle}
            themeColors={themeColors}
            newPhase={newPhase}
          />
        )}

        {ceremonyPhase === 'transformation' && (
          <ParticleLayer
            particleStyle={styles.particleStyle}
            themeColors={themeColors}
          />
        )}

        {(ceremonyPhase === 'celebration' ||
          ceremonyPhase === 'complete') && (
          <CelebrationLayer
            textStyle={styles.textStyle}
            themeColors={themeColors}
            newPhase={newPhase}
            totalFocusMinutes={previousState.totalFocusMinutes}
          />
        )}

        {ceremonyPhase === 'complete' && (
          <Box
            position="absolute"
            bottom={40}
            alignItems="center"
            zIndex={40}
          >
            <Text variant="caption" color="text.tertiary">
              Tap anywhere to continue
            </Text>
          </Box>
        )}

        <PhaseIndicators
          ceremonyPhase={ceremonyPhase}
          themeColors={themeColors}
        />
      </Box>
    </Pressable>
  );
};
