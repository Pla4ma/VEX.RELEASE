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
} from '../../../features/onboarding/store';
import type { OnboardingGoal } from '../../../features/onboarding/schemas';
import { useAuthStore } from '../../../features/onboarding/store';
import { useOnboardingLane } from './useOnboardingLane';
import { clampStep, buildDraftPayload } from '../onboarding-flow-steps';
import { useOnboardingCompletion } from './useOnboardingCompletion';
import { buildOnboardingHandlers } from './onboarding-flow-handlers';
import type { RootStackParams } from '../../../navigation/param-types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export function useOnboardingFlow(routeStep?: number) {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
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
  const [hasCompletedFirstSession, setHasCompletedFirstSession] = useState(false);
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

  const startFirstSession = useCallback(() => {
    if (!userId || !chosenLane) return;

    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: {
        presetId: chosenLane,
        source: 'onboarding_first_session',
      },
    });
  }, [userId, chosenLane, navigation]);

  const handleSessionComplete = useCallback(() => {
    setHasCompletedFirstSession(true);
    // Advance step to trigger completion on return
    setStep((prev) => Math.min(prev + 1, 3));
  }, []);

  // Listen for session completion event
  useEffect(() => {
    if (!userId) return;
    // In a real implementation, this would subscribe to an event bus
    // For now, we rely on the focus detection in the screen component
  }, [userId]);

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
    hasCompletedFirstSession,
    chosenLane,
    handleAcceptLaneAndAdvance: handlers.handleAcceptLaneAndAdvance,
    handleChooseAnotherLane,
    handleSelectLane,
    handleFinish: handlers.handleFinish,
    handleSelectGoal: handlers.handleSelectGoal,
    handleSelectMotivationStyle: handlers.handleSelectMotivationStyle,
    startFirstSession,
    handleSessionComplete,
  };
}
