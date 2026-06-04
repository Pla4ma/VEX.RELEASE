import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDisclosureAnalytics } from '../../../features/liveops-config';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { RouteProp } from '@react-navigation/native';
export type OnboardingRouteProp = RouteProp<ExtendedRootStackParams, 'Onboarding'>;
import {
  ONBOARDING_GOALS,
  useOnboardingStore,
  type OnboardingGoal,
} from '../../../features/onboarding';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { triggerHaptic } from '../../../utils/haptics';
import { useOnboardingLane } from './useOnboardingLane';
import { STARTER_PRESETS } from '../components';
import {
  LAST_STEP_INDEX,
  clampStep,
  buildDraftPayload,
} from '../onboarding-flow-steps';
import { useOnboardingCompletion } from './useOnboardingCompletion';
import { buildOnboardingHandlers } from './onboarding-flow-handlers';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export function useOnboardingFlow(routeStep?: number) {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const draft = useOnboardingStore((state) =>
    userId ? state.getDraft(userId) : undefined,
  );
  const saveDraft = useOnboardingStore((state) => state.saveDraft);
  const setExplicitMotivationStyle = useOnboardingStore(
    (state) => state.setExplicitMotivationStyle,
  );
  const disclosureAnalytics = useDisclosureAnalytics();
  const [step, setStep] = useState(clampStep(routeStep));
  const [goal, setGoal] = useState<OnboardingGoal | undefined>(draft?.goal);
  const [motivationStyle, setMotivationStyle] = useState(
    draft?.explicitMotivationStyle,
  );
  const [starterPresetId, setStarterPresetId] = useState<string | undefined>(
    draft?.starterPresetId ?? STARTER_PRESETS[0]?.id,
  );
  const [isLaunchingSession, setIsLaunchingSession] = useState(false);
  const [hasSeenFirstWin, setHasSeenFirstWin] = useState(false);
  const startedTrackedRef = useRef(false);
  const firstSessionCompletedTrackedRef = useRef(false);
  const historyQuery = useSessionHistory(userId || '', 1);
  const { isFinishing, finishError, completedRef, finishOnboarding } =
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

  const selectedGoal = useMemo(
    () => ONBOARDING_GOALS.find((item) => item.id === goal),
    [goal],
  );
  const selectedPreset = useMemo(
    () => STARTER_PRESETS.find((preset) => preset.id === starterPresetId),
    [starterPresetId],
  );

  const persistDraft = useCallback((): void => {
    if (!userId) {return;}
    saveDraft(
      userId,
      buildDraftPayload({
        goal,
        motivationStyle,
        starterPresetId,
        chosenLane: chosenLane ?? undefined,
      }),
    );
  }, [goal, motivationStyle, saveDraft, starterPresetId, userId, chosenLane]);

  useEffect(() => {
    if (!userId || startedTrackedRef.current) {return;}
    startedTrackedRef.current = true;
    disclosureAnalytics.trackOnboardingStarted(userId);
  }, [disclosureAnalytics, userId]);

  useEffect(() => { persistDraft(); }, [persistDraft, step]);
  useEffect(() => { if (step === 2 && motivationStyle) {computeLaneConfirmation();} }, [step, motivationStyle, computeLaneConfirmation]);

  useEffect(() => {
    navigation.setParams({ step });
  }, [navigation, step]);

  useEffect(() => {
    if (!isFocused || step !== LAST_STEP_INDEX || completedRef.current) {return;}
    if (historyQuery.history.length === 0) {return;}
    setHasSeenFirstWin(true);
    if (!firstSessionCompletedTrackedRef.current && userId) {
      firstSessionCompletedTrackedRef.current = true;
      disclosureAnalytics.trackOnboardingFirstSessionCompleted(userId);
    }
  }, [
    disclosureAnalytics,
    historyQuery.history.length,
    isFocused,
    step,
    userId,
    completedRef,
  ]);

  const handlers = buildOnboardingHandlers({
    userId,
    goal,
    motivationStyle,
    starterPresetId,
    selectedGoal,
    selectedPreset,
    setGoal,
    setMotivationStyle,
    setExplicitMotivationStyle,
    setStep,
    setIsLaunchingSession,
    disclosureAnalytics,
    navigation,
    handleAcceptLane,
    finishOnboarding,
  });

  return {
    userId,
    step,
    setStep,
    goal,
    motivationStyle,
    starterPresetId,
    setStarterPresetId,
    isFinishing,
    isLaunchingSession,
    finishError,
    hasSeenFirstWin,
    historyQuery,
    laneConfirmation,
    isChoosingLane,
    handleAcceptLaneAndAdvance: handlers.handleAcceptLaneAndAdvance,
    handleChooseAnotherLane,
    handleSelectLane,
    selectedGoal,
    selectedPreset,
    handleFinish: handlers.handleFinish,
    handleSelectGoal: handlers.handleSelectGoal,
    handleSelectMotivationStyle: handlers.handleSelectMotivationStyle,
    handleStartFirstSession: handlers.handleStartFirstSession,
  };
}
