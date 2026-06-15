import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { ONBOARDING_PROGRESS_PHASES } from './onboarding-flow-data';

type ProgressPhaseIndex = 0 | 1 | 2;

type OnboardingProgressIndicatorProps = {
  phaseIndex: ProgressPhaseIndex;
};

export function getProgressPhaseIndex(
  step: number,
  lastStepIndex: number,
): ProgressPhaseIndex {
  if (step >= lastStepIndex - 1) {return 2;}
  if (step >= 2) {return 1;}
  return 0;
}

export function OnboardingProgressIndicator({
  phaseIndex,
}: OnboardingProgressIndicatorProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel={`Onboarding progress: ${ONBOARDING_PROGRESS_PHASES[phaseIndex]}`}
      accessibilityRole="text"
      style={{ flexDirection: 'row', gap: theme.spacing[2] }}
    >
      {ONBOARDING_PROGRESS_PHASES.map((phase, index) => {
        const isActive = index === phaseIndex;
        return (
          <View
            key={phase}
            style={{
              backgroundColor: isActive
                ? theme.colors.primary[500]
                : theme.colors.background.secondary,
              borderColor: isActive
                ? theme.colors.primary[500]
                : theme.colors.border.DEFAULT,
              borderRadius: theme.borderRadius.full,
              borderWidth: 1,
              minHeight: 32,
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[1],
            }}
          >
            <Text
              style={{
                color: isActive
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {phase}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
