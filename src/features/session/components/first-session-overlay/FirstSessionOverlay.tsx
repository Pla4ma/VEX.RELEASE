/**
 * First Session Overlay Component
 *
 * Onboarding overlay shown during the user's first session.
 */

import React, { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Box } from '../../../../components/primitives/Box';
import { useTheme } from '../../../../theme';
import { TooltipCard } from './TooltipCard';
import { HighlightRing } from './HighlightRing';
import { TOOLTIPS } from './constants';
import type { FirstSessionOverlayProps } from './types';

export function FirstSessionOverlay({
  currentStep,
  onNext,
  onDismiss,
  timerPosition,
  qualityPosition,
  bossPosition,
}: FirstSessionOverlayProps): JSX.Element | null {
  const { theme } = useTheme();
  const { height, width } = useWindowDimensions();

  const currentTooltip =
    TOOLTIPS[currentStep] ?? TOOLTIPS[TOOLTIPS.length - 1]!;
  const isLast = currentStep === TOOLTIPS.length - 1;

  // Get position for current highlight
  const getHighlightPosition = React.useCallback(():
    | { x: number; y: number }
    | undefined => {
    switch (currentTooltip.target) {
      case 'timer':
        return timerPosition ?? { x: width / 2, y: height / 2 - 50 };
      case 'quality':
        return qualityPosition ?? { x: width / 2, y: height / 2 + 80 };
      case 'boss':
        return bossPosition ?? { x: width / 2, y: 120 };
      default:
        return undefined;
    }
  }, [
    currentTooltip.target,
    timerPosition,
    qualityPosition,
    bossPosition,
    width,
    height,
  ]);

  const highlightPos = getHighlightPosition();

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Don't render if all steps completed
  if (currentStep >= TOOLTIPS.length) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      style={{ zIndex: 1000 }}
    >
      {/* Dark overlay */}
      <Box
        flex={1}
        bg={`${theme.colors.background.primary}CC`}
        justifyContent="center"
        alignItems="center"
      >
        {/* Highlight ring around target element */}
        <HighlightRing visible={!!highlightPos} position={highlightPos} />

        {/* Tooltip card */}
        <TooltipCard
          step={currentTooltip}
          onNext={handleNext}
          onDismiss={handleDismiss}
          isLast={isLast}
        />
      </Box>
    </Box>
  );
}
