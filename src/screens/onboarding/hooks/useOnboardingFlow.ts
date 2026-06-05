import { useCallback, useEffect, useRef, useState } from 'react';
import { useDisclosureAnalytics } from '../../../features/liveops-config';
import type { OnboardingStackParams } from '../../../navigation/OnboardingNavigator';
import type { RouteProp } from '@react-navigation/native';
export type OnboardingRouteProp = RouteProp<
  OnboardingStackParams,
  'OnboardingFlow'
>;
import {
  useOnboardingStore,
  type OnboardingGoal,
} from '../../../features/onboarding';
import { useAuthStore } from '../../../store';
import { useOnboardingLane } from './useOnboardingLane';
import { clampStep, buildDraftPayload } from '../onboarding-flow-steps';
import { useOnboardingCompletion } from './useOnboardingCompletion';
import { buildOnboardingHandlers } from './onboarding-flow-handlers';

export function useOnboardingFlow(routeStep?: number) {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const draft = useOnboardingStore((state) =>
    userId ? state.getDraft(userId) : undefined,
  );
  const saveDraft = useOnboardingStore((state) => state.saveDraft);
  const setChosenLane = useOnboardingStore((state) => state.setChosenLane);
  const setExplicitMotivationStyle = useOnboardingStore(
    (state) => state.setExplicitMotivationStyle,
  );
  const disclosureAnalytics = useDisclosureAnalytics();
  const [step, setStep] = useState(clampStep(routeStep));
  const [goal, setGoal] = useState<OnboardingGoal | undefined>(draft?.goal);
  const [motivationStyle, setMotivationStyle] = useState(
    draft?.explicitMotivationStyle,
  );
  const startedTrackedRef = useRef(false);
  const { isFinishing, finishError, finishOnboarding } =
    useOnboardingCompletion(userId);

  const {
    laneConfirmation,
    chosenLane,
    isChoosingLane,
    computeLaneConfirmation,
    handleAcceptLane,
    handleChooseAnotherLane,
    handleSelectLane,
  } = useOnboardingLane(goal, motivationStyle);

  const persistDraft = useCallback((): void => {
    if (!userId) {return;}
    saveDraft(
      userId,
      buildDraftPayload({
        goal,
        motivationStyle,
        chosenLane: chosenLane ?? undefined,
      }),
    );
  }, [goal, motivationStyle, saveDraft, userId, chosenLane]);

  useEffect(() => {
    if (!userId || startedTrackedRef.current) {return;}
    startedTrackedRef.current = true;
    disclosureAnalytics.trackOnboardingStarted(userId);
  }, [disclosureAnalytics, userId]);

  useEffect(() => { persistDraft(); }, [persistDraft]);
  useEffect(() => { if (step === 2 && motivationStyle) {computeLaneConfirmation();} }, [step, motivationStyle, computeLaneConfirmation]);

  const handlers = buildOnboardingHandlers({
    userId,
    goal,
    setGoal,
    setMotivationStyle,
    setExplicitMotivationStyle,
    disclosureAnalytics,
    handleAcceptLane,
    setChosenLane,
    finishOnboarding,
  });

  return {
    userId,
    step,
    setStep,
    goal,
    motivationStyle,
    isFinishing,
    finishError,
    laneConfirmation,
    isChoosingLane,
    handleAcceptLaneAndAdvance: handlers.handleAcceptLaneAndAdvance,
    handleChooseAnotherLane,
    handleSelectLane,
    handleFinish: handlers.handleFinish,
    handleSelectGoal: handlers.handleSelectGoal,
    handleSelectMotivationStyle: handlers.handleSelectMotivationStyle,
  };
}
