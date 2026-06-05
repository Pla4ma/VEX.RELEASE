import * as Sentry from '@sentry/react-native';
import type {
  MotivationProfileType,
  OnboardingGoal,
} from '../../../features/onboarding';
import type { useOnboardingCompletion } from './useOnboardingCompletion';
import type { useOnboardingLane } from './useOnboardingLane';

export interface OnboardingFlowHandlers {
  handleSelectGoal: (nextGoal: OnboardingGoal) => void;
  handleSelectMotivationStyle: (style: MotivationProfileType) => void;
  handleAcceptLaneAndAdvance: (
    lane: import('../../../features/lane-engine').Lane,
  ) => void;
  handleFinish: (message?: string) => void;
}

export function buildOnboardingHandlers(deps: {
  userId: string;
  goal: OnboardingGoal | undefined;
  setGoal: (goal: OnboardingGoal) => void;
  setMotivationStyle: (style: MotivationProfileType | undefined) => void;
  setExplicitMotivationStyle: (style: MotivationProfileType) => void;
  disclosureAnalytics: {
    trackOnboardingGoalSet: (userId: string, goal: OnboardingGoal) => void;
  };
  handleAcceptLane: ReturnType<typeof useOnboardingLane>['handleAcceptLane'];
  setChosenLane: (lane: import('../../../features/lane-engine').Lane) => void;
  finishOnboarding: ReturnType<typeof useOnboardingCompletion>['finishOnboarding'];
}): OnboardingFlowHandlers {
  return {
    handleSelectGoal(nextGoal: OnboardingGoal): void {
      deps.setGoal(nextGoal);
      if (deps.userId) {
        deps.disclosureAnalytics.trackOnboardingGoalSet(deps.userId, nextGoal);
      }
    },
    handleSelectMotivationStyle(style: MotivationProfileType): void {
      deps.setMotivationStyle(style);
      deps.setExplicitMotivationStyle(style);
    },
    handleAcceptLaneAndAdvance(
      lane: import('../../../features/lane-engine').Lane,
    ): void {
      deps.handleAcceptLane(lane);
      deps.setChosenLane(lane);
      deps.finishOnboarding(deps.goal, undefined).catch((error: unknown) => {
        Sentry.captureException(error, {
          tags: { feature: 'onboarding', operation: 'finishOnboarding' },
        });
      });
    },
    handleFinish(message?: string): void {
      deps.finishOnboarding(deps.goal, message).catch(
        (error: unknown) => {
          Sentry.captureException(error, {
            tags: { feature: 'onboarding', operation: 'finishOnboarding' },
          });
        },
      );
    },
  };
}
