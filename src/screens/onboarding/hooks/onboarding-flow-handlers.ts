import * as Sentry from '@sentry/react-native';
import type { OnboardingGoal } from '../../../features/onboarding';
import type { useOnboardingCompletion } from './useOnboardingCompletion';
import type { useOnboardingLane } from './useOnboardingLane';

export interface OnboardingFlowHandlers {
  handleSelectGoal: (nextGoal: OnboardingGoal) => void;
  handleSelectMotivationStyle: (style: string | undefined) => void;
  handleAcceptLaneAndAdvance: (
    lane: import('../../../features/lane-engine').Lane,
  ) => void;
  handleStartFirstSession: () => void;
  handleFinish: (message?: string) => void;
}

export function buildOnboardingHandlers(deps: {
  userId: string;
  goal: OnboardingGoal | undefined;
  motivationStyle: string | undefined;
  starterPresetId: string | undefined;
  selectedGoal: { label: string } | undefined;
  selectedPreset: { id: string } | undefined;
  setGoal: (goal: OnboardingGoal) => void;
  setMotivationStyle: (style: string | undefined) => void;
  setExplicitMotivationStyle: (style: string | undefined) => void;
  setStep: (step: number) => void;
  setIsLaunchingSession: (launching: boolean) => void;
  disclosureAnalytics: {
    trackOnboardingGoalSet: (userId: string, goal: OnboardingGoal) => void;
    trackFirstSessionStarted: (userId: string, source: string) => void;
  };
  navigation: {
    navigate: (screen: string, params: unknown) => void;
  };
  handleAcceptLane: ReturnType<typeof useOnboardingLane>['handleAcceptLane'];
  finishOnboarding: ReturnType<typeof useOnboardingCompletion>['finishOnboarding'];
}): OnboardingFlowHandlers {
  return {
    handleSelectGoal(nextGoal: OnboardingGoal): void {
      deps.setGoal(nextGoal);
      if (deps.userId) {
        deps.disclosureAnalytics.trackOnboardingGoalSet(deps.userId, nextGoal);
      }
    },
    handleSelectMotivationStyle(style: string | undefined): void {
      if (!style) {return;}
      deps.setMotivationStyle(style);
      deps.setExplicitMotivationStyle(style);
    },
    handleAcceptLaneAndAdvance(
      lane: import('../../../features/lane-engine').Lane,
    ): void {
      deps.handleAcceptLane(lane);
      deps.setStep(3);
    },
    handleStartFirstSession(): void {
      if (!deps.selectedPreset) {return;}
      deps.setIsLaunchingSession(true);
      deps.disclosureAnalytics.trackFirstSessionStarted(deps.userId, 'onboarding');
      deps.navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: {
          goal: deps.selectedGoal?.label,
          presetId: deps.selectedPreset.id,
          source: 'onboarding_first_session',
        },
      });
      deps.setIsLaunchingSession(false);
    },
    handleFinish(message?: string): void {
      deps.finishOnboarding(deps.goal, deps.starterPresetId, message).catch(
        (error: unknown) => {
          Sentry.captureException(error, {
            tags: { feature: 'onboarding', operation: 'finishOnboarding' },
          });
        },
      );
    },
  };
}
