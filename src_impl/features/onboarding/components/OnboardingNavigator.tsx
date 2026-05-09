/**
 * OnboardingNavigator Component
 *
 * Main container for the 5-step onboarding flow.
 * Manages step navigation, progress bar, and skip functionality.
 *
 * @phase 2.1
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { useOnboardingStore, useOnboardingProgress } from '../store';
import type { FocusGoal } from '../schemas';
import {
  saveGoal,
  saveDisplayName,
  goToNextStep,
  goToPreviousStep,
  skipOnboarding,
  completeOnboarding,
  getFirstSessionConfig,
} from '../service';
import { WelcomeScreen } from './WelcomeScreen';
import { NameAndGoalScreen } from './NameAndGoalScreen';
import { CompanionRevealScreen } from './CompanionRevealScreen';
import { FirstSessionSetup } from './FirstSessionSetup';
import { OnboardingProgressBar, OnboardingDots } from './OnboardingProgressBar';

interface OnboardingNavigatorProps {
  /** Navigate to active session */
  onStartSession: (config: { duration: number; category: FocusGoal | null }) => void;
  /** Navigate back to auth/previous screen */
  onBack?: () => void;
}

/**
 * Onboarding flow navigator
 */
export function OnboardingNavigator({
  onStartSession,
  onBack,
}: OnboardingNavigatorProps): JSX.Element {
  const store = useOnboardingStore();
  const progress = useOnboardingProgress();

  const currentStep = store.currentStep;

  // Step 0: Welcome
  const handleWelcomeStart = useCallback(() => {
    store.startOnboarding();
    goToNextStep();
  }, [store]);

  // Step 1: Name and Goal Selection
  const handleNameAndGoalContinue = useCallback((name: string, goal: FocusGoal) => {
    if (saveDisplayName(name)) {
      saveGoal(goal);
    }
  }, []);

  const handleNameAndGoalSkip = useCallback(() => {
    skipOnboarding();
  }, []);

  // Step 2: Companion Reveal
  const handleCompanionContinue = useCallback(() => {
    goToNextStep();
  }, []);

  // Step 3: First Session Setup
  const handleSessionStart = useCallback((config: { duration: number; category: FocusGoal | null }) => {
    completeOnboarding();
    onStartSession(config);
  }, [onStartSession]);

  const handleSessionBack = useCallback(() => {
    goToPreviousStep();
  }, []);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onStart={handleWelcomeStart} />;
      case 1:
        return (
          <NameAndGoalScreen
            onContinue={handleNameAndGoalContinue}
            onSkip={handleNameAndGoalSkip}
            onBack={onBack}
          />
        );
      case 2:
        return (
          <CompanionRevealScreen
            userName={store.displayName || ''}
            onContinue={handleCompanionContinue}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
            <FirstSessionSetup
              userName={store.displayName || ''}
              goal={store.goal}
            onStartSession={handleSessionStart}
            onBack={handleSessionBack}
          />
        );
      default:
        return <WelcomeScreen onStart={handleWelcomeStart} />;
    }
  };

  // Don't show progress bar on welcome screen
  const showProgress = currentStep > 0 && currentStep < 4;

  return (
    <View style={{ flex: 1 }}>
      {/* Progress Indicator */}
      {showProgress && (
        <OnboardingDots
          currentStep={currentStep - 1} // Adjust for welcome being step 0
          totalSteps={4}
        />
      )}

      {/* Current Step Screen */}
      <Box flex={1}>{renderStep()}</Box>
    </View>
  );
}

export default OnboardingNavigator;
