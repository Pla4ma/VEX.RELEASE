import React, { useCallback } from 'react';
import { View } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { useOnboardingStore } from '../store';
import { useOnboardingProgress } from '../store-hooks';
import type { FocusGoal, MotivationProfileType } from '../schemas';
import {
  goToNextStep, goToPreviousStep, completeOnboarding,
} from '../service';
import { WelcomeScreen } from './WelcomeScreen';
import { MotivationScreen } from './MotivationScreen';
import { FirstSessionSetup } from './FirstSessionSetup';
import { OnboardingDots } from './OnboardingProgressBar';

interface OnboardingNavigatorProps {
  onStartSession: (config: { duration: number; category: FocusGoal | null }) => void;
  onBack?: () => void;
}

export function OnboardingNavigator({ onStartSession, onBack }: OnboardingNavigatorProps): JSX.Element {
  const store = useOnboardingStore();
  useOnboardingProgress();
  const currentStep = store.currentStep;

  const handleWelcomeStart = useCallback(() => {
    store.startOnboarding();
    goToNextStep();
  }, [store]);

  const handleMotivationSelect = useCallback((style: MotivationProfileType) => {
    store.setExplicitMotivationStyle(style);
    goToNextStep();
  }, [store]);

  const handleSessionStart = useCallback(
    (config: { duration: number; category: FocusGoal | null }) => {
      completeOnboarding();
      onStartSession(config);
    },
    [onStartSession],
  );

  const handleSessionBack = useCallback(() => { goToPreviousStep(); }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeScreen onStart={handleWelcomeStart} />;
      case 1: return (
        <MotivationScreen onSelect={handleMotivationSelect} onBack={goToPreviousStep} />
      );
      case 2: return (
        <FirstSessionSetup
          userName={store.displayName || ''} goal={store.goal}
          onStartSession={handleSessionStart} onBack={handleSessionBack}
        />
      );
      default: return <WelcomeScreen onStart={handleWelcomeStart} />;
    }
  };

  const showProgress = currentStep > 0 && currentStep < 3;

  return (
    <View style={{ flex: 1 }}>
      {showProgress && (
        <OnboardingDots currentStep={currentStep - 1} totalSteps={2} />
      )}
      <Box flex={1}>{renderStep()}</Box>
    </View>
  );
}

export default OnboardingNavigator;
