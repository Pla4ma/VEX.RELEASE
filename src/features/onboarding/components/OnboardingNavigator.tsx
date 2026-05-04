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
import type { FocusGoal, FocusDuration } from '../schemas';
import {
  saveGoal,
  saveFocusDuration,
  saveDisplayName,
  goToNextStep,
  goToPreviousStep,
  skipOnboarding,
  completeOnboarding,
  getFirstSessionConfig,
} from '../service';
import { WelcomeScreen } from './WelcomeScreen';
import { GoalScreen } from './GoalScreen';
import { FocusTimeScreen } from './FocusTimeScreen';
import { NameScreen } from './NameScreen';
import { FirstSessionCTA } from './FirstSessionCTA';
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

  // Step 1: Goal Selection
  const handleGoalSelect = useCallback((goal: FocusGoal) => {
    saveGoal(goal);
  }, []);

  const handleGoalSkip = useCallback(() => {
    skipOnboarding();
  }, []);

  // Step 2: Focus Duration
  const handleDurationSelect = useCallback((duration: FocusDuration) => {
    saveFocusDuration(duration);
  }, []);

  const handleDurationSkip = useCallback(() => {
    skipOnboarding();
  }, []);

  // Step 3: Name Setup
  const handleNameContinue = useCallback((name: string) => {
    if (saveDisplayName(name)) {
      goToNextStep();
    }
  }, []);

  const handleNameSkip = useCallback(() => {
    goToNextStep();
  }, []);

  // Step 4: First Session CTA
  const handleStartSession = useCallback(() => {
    const config = getFirstSessionConfig();
    completeOnboarding();
    onStartSession(config);
  }, [onStartSession]);

  const handleCTABack = useCallback(() => {
    goToPreviousStep();
  }, []);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onStart={handleWelcomeStart} />;
      case 1:
        return (
          <GoalScreen
            onSelect={handleGoalSelect}
            onSkip={handleGoalSkip}
          />
        );
      case 2:
        return (
          <FocusTimeScreen
            onSelect={handleDurationSelect}
            onSkip={handleDurationSkip}
          />
        );
      case 3:
        return (
          <NameScreen
            onContinue={handleNameContinue}
            onSkip={handleNameSkip}
          />
        );
      case 4:
        return (
          <FirstSessionCTA
            userName={store.displayName}
            duration={store.focusDuration}
            goal={store.goal}
            onStartSession={handleStartSession}
            onBack={handleCTABack}
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
