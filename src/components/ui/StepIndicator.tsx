import React from 'react';
import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeContext';

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
  labels?: string[];
  color?: string;
  accessibilityLabel?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  labels,
  color,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const stepColor = color ?? theme.colors.semantic.primary;
  return (
    <View
      style={{ alignItems: 'flex-start', flexDirection: 'row' }}
      accessibilityLabel={accessibilityLabel ?? `Step ${currentStep + 1} of ${steps}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: steps, now: currentStep + 1 }}
    >
      {Array.from({ length: steps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const fillColor = isCompleted
          ? stepColor
          : isCurrent
            ? theme.colors.semantic.surface
            : theme.colors.semantic.border;
        return (
          <View
            key={index}
            style={{ alignItems: 'center', flex: 1, flexDirection: 'row' }}
          >
            <View
              style={{
                alignItems: 'center',
                backgroundColor: fillColor,
                borderColor: isCurrent ? stepColor : fillColor,
                borderRadius: 14,
                borderWidth: isCurrent ? 2 : 0,
                height: 28,
                justifyContent: 'center',
                width: 28,
              }}
              accessibilityLabel={
                isCompleted
                  ? `Step ${index + 1} completed`
                  : isCurrent
                    ? `Step ${index + 1} current`
                    : `Step ${index + 1} not started`
              }
              accessibilityRole="text"
            >
              <Text
                color={
                  isCompleted
                    ? 'text.inverse'
                    : isCurrent
                      ? stepColor
                      : 'text.muted'
                }
                fontSize={12}
                fontWeight="700"
              >
                {isCompleted ? '✓' : index + 1}
              </Text>
            </View>
            {labels?.[index] ? (
              <Text
                color={isCurrent || isCompleted ? stepColor : 'text.muted'}
                fontSize={10}
                textAlign="center"
                style={{ left: 0, position: 'absolute', right: 0, top: 32 }}
              >
                {labels[index]}
              </Text>
            ) : null}
            {index < steps - 1 ? (
              <View
                style={{
                  backgroundColor: isCompleted
                    ? stepColor
                    : theme.colors.semantic.border,
                  flex: 1,
                  height: 2,
                  marginHorizontal: 4,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export default StepIndicator;
