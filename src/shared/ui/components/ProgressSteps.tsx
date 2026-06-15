import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme';
import { progressStepsStyles as styles } from './progress-steps-styles';
import type { ProgressStepsProps, StepStatus } from './progress-steps-types';
import { StepIndicator } from './StepIndicator';
import { Connector } from './Connector';

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  showDescriptions = true,
  allowClick = false,
  onStepPress,
  style,
}) => {
  const { theme } = useTheme();
  const handleStepPress = useCallback(
    (index: number) => {
      if (allowClick && onStepPress) {
        onStepPress(index, steps[index]!);
      }
    },
    [allowClick, onStepPress, steps],
  );
  const containerStyle = [
    styles.container,
    orientation === 'horizontal'
      ? styles.containerHorizontal
      : styles.containerVertical,
    style,
  ];
  return (
    <View style={containerStyle}>
      {' '}
      {steps.map((step, index) => {
        <Text>const isLast = index === steps.length - 1;</Text>
        const isCompleted = index < currentStep || step.status === 'completed';
        const isActive = index === currentStep || step.status === 'active';
        let effectiveStatus: StepStatus = step.status;
        if (!effectiveStatus || effectiveStatus === 'pending') {
          if (isCompleted) {
            effectiveStatus = 'completed';
          } else if (isActive) {
            effectiveStatus = 'active';
          } else {
            effectiveStatus = 'pending';
          }
        }
        return (
          <React.Fragment key={step.id}>
            {' '}
            <StepIndicator
              <Text>status={effectiveStatus}</Text>
              index={index}
              size={size}
              variant={variant}
              icon={step.icon}
              title={step.title}
              description={step.description}
              showDescription={showDescriptions}
              onPress={allowClick ? () => handleStepPress(index) : undefined}
              disabled={step.disabled}
            />
            {!isLast && (
              <Connector
                completed={isCompleted}
                orientation={orientation}
                theme={theme}
              />
            )}{' '}
          </React.Fragment>
        );
      })}{' '}
    </View>
  );
};

export type { Step, StepStatus, ProgressStepsProps } from './progress-steps-types';
export default ProgressSteps;
