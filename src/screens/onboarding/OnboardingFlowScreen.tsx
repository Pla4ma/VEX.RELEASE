import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import { useDisclosureAnalytics } from '../../features/liveops-config';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { ONBOARDING_GOALS, useOnboardingStore, type OnboardingGoal } from '../../features/onboarding';
import { useSessionHistory } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import { useSessionUIStore } from '../../store/session-state';
import { triggerHaptic } from '../../utils/haptics';
import { useOnboardingLane } from './hooks/useOnboardingLane';
import {
  GoalStep,
  LaneConfirmationStep,
  LaneChoiceStep,
  LauncherStep,
  MotivationStyleStep,
  OnboardingFlowLayout,
  SignedOutOnboardingState,
  STARTER_PRESETS,
  StarterStep,
} from './components';
import { LAST_STEP_INDEX, clampStep, buildDraftPayload, getStepValidation } from './onboarding-flow-steps';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type OnboardingRouteProp = RouteProp<ExtendedRootStackParams, 'Onboarding'>;

export function OnboardingFlowScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OnboardingRouteProp>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const draft = useOnboardingStore((state) => (userId ? state.getDraft(userId) : undefined));
  const saveDraft = useOnboardingStore((state) => state.saveDraft);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const setExplicitMotivationStyle = useOnboardingStore((state) => state.setExplicitMotivationStyle);
  const showHomeHighlight = useSessionUIStore((state) => state.showHomeHighlight);
  const disclosureAnalytics = useDisclosureAnalytics();
  const [step, setStep] = useState(clampStep(route.params?.step));
  const [goal, setGoal] = useState<OnboardingGoal | undefined>(draft?.goal);
  const [motivationStyle, setMotivationStyle] = useState(draft?.explicitMotivationStyle);
  const [starterPresetId, setStarterPresetId] = useState<string | undefined>(
    draft?.starterPresetId ?? STARTER_PRESETS[0]?.id,
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLaunchingSession, setIsLaunchingSession] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [hasSeenFirstWin, setHasSeenFirstWin] = useState(false);
  const completedRef = useRef(false);
  const startedTrackedRef = useRef(false);
  const firstSessionCompletedTrackedRef = useRef(false);
  const historyQuery = useSessionHistory(userId || '', 1);

  const {
    laneConfirmation,
    chosenLane,
    isChoosingLane,
    computeLaneConfirmation,
    handleAcceptLane,
    handleChooseAnotherLane,
    handleSelectLane,
  } = useOnboardingLane(goal, motivationStyle);

  const selectedGoal = useMemo(() => ONBOARDING_GOALS.find((item) => item.id === goal), [goal]);
  const selectedPreset = useMemo(
    () => STARTER_PRESETS.find((preset) => preset.id === starterPresetId),
    [starterPresetId],
  );

  const persistDraft = useCallback((): void => {
    if (!userId) return;
    saveDraft(userId, buildDraftPayload({ goal, motivationStyle, starterPresetId, chosenLane: chosenLane ?? undefined }));
  }, [goal, motivationStyle, saveDraft, starterPresetId, userId, chosenLane]);

  useEffect(() => {
    if (!userId || startedTrackedRef.current) return;
    startedTrackedRef.current = true;
    disclosureAnalytics.trackOnboardingStarted(userId);
  }, [disclosureAnalytics, userId]);

  useEffect(() => { persistDraft(); }, [persistDraft, step]);

  useEffect(() => {
    if (step === 2 && motivationStyle) computeLaneConfirmation();
  }, [step, motivationStyle, computeLaneConfirmation]);

  const handleAcceptLaneAndAdvance = useCallback((lane: import('../../features/lane-engine').Lane): void => {
    handleAcceptLane(lane);
    setStep(3);
  }, [handleAcceptLane]);

  useEffect(() => { navigation.setParams({ step }); }, [navigation, step]);

  useEffect(() => {
    if (!isFocused || step !== LAST_STEP_INDEX || completedRef.current) return;
    if (historyQuery.history.length === 0) return;
    setHasSeenFirstWin(true);
    if (!firstSessionCompletedTrackedRef.current && userId) {
      firstSessionCompletedTrackedRef.current = true;
      disclosureAnalytics.trackOnboardingFirstSessionCompleted(userId);
    }
  }, [disclosureAnalytics, historyQuery.history.length, isFocused, step, userId]);

  const finishOnboarding = useCallback(async (message?: string): Promise<void> => {
    if (!userId || !goal || !starterPresetId) return;
    setIsFinishing(true);
    setFinishError(null); completedRef.current = true;
    try {
      completeOnboarding();
      disclosureAnalytics.trackOnboardingCompleted(userId);
      showHomeHighlight({
        title: 'VEX is ready for your first real session',
        message: message ?? 'Start one clean focus block and VEX will begin tailoring the next action around your progress.',
        tone: 'celebration',
      });
      triggerHaptic('success').catch(() => undefined);
      navigation.replace('Main', { screen: 'Home', params: message ? { comebackMessage: message } : undefined });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'onboarding', operation: 'finishOnboarding' },
      });
      completedRef.current = false;
      setFinishError('We could not finish setup right now. Please try once more.');
    } finally { setIsFinishing(false); }
  }, [completeOnboarding, disclosureAnalytics, goal, navigation, showHomeHighlight, starterPresetId, userId]);

  const handleSelectGoal = useCallback((nextGoal: OnboardingGoal): void => {
    setGoal(nextGoal);
    if (userId) { disclosureAnalytics.trackOnboardingGoalSet(userId, nextGoal); }
  }, [disclosureAnalytics, userId]);

  const handleSelectMotivationStyle = useCallback((style: typeof motivationStyle): void => {
    if (!style) return;
    setMotivationStyle(style);
    setExplicitMotivationStyle(style);
  }, [setExplicitMotivationStyle]);

  const handleStartFirstSession = useCallback((): void => {
    if (!selectedPreset) return;
    setIsLaunchingSession(true);
    triggerHaptic('impactMedium').catch(() => undefined);
    disclosureAnalytics.trackFirstSessionStarted(userId, 'onboarding');
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { goal: selectedGoal?.label, presetId: selectedPreset.id, source: 'onboarding_first_session' },
    });
    setIsLaunchingSession(false);
  }, [disclosureAnalytics, navigation, selectedGoal?.label, selectedPreset, userId]);

  if (!userId) return <SignedOutOnboardingState />;

  const { isContinueDisabled } = getStepValidation(step, goal, motivationStyle, isFinishing);

  return (
    <OnboardingFlowLayout
      finishError={finishError}
      isContinueDisabled={isContinueDisabled}
      isFinishing={isFinishing}
      lastStepIndex={LAST_STEP_INDEX}
      onBack={() => setStep(step - 1)}
      onContinue={() => setStep(step + 1)}
      onRetryFinish={() => { finishOnboarding().catch(() => undefined); }}
      step={step}
    >
      {step === 0 ? <GoalStep goal={goal} onSelectGoal={handleSelectGoal} /> : null}
      {step === 1 ? (
        <MotivationStyleStep goal={goal} motivationStyle={motivationStyle} onSelectStyle={handleSelectMotivationStyle} />
      ) : null}
      {step === 2 ? (
        isChoosingLane ? (
          <LaneChoiceStep onSelect={handleSelectLane} />
        ) : (
          <LaneConfirmationStep
            confirmation={laneConfirmation}
            isChoosing={false}
            onAccept={handleAcceptLaneAndAdvance}
            onChooseAnother={handleChooseAnotherLane}
          />
        )
      ) : null}
      {step === 3 ? <StarterStep starterPresetId={starterPresetId} onSelectPreset={setStarterPresetId} /> : null}
      {step === 4 ? (
        <LauncherStep
          firstSessionXp={historyQuery.history[0]?.summary?.xpEarned ?? 50}
          hasSeenFirstWin={hasSeenFirstWin}
          isFinishing={isFinishing}
          isLaunchingSession={isLaunchingSession}
          onFinishOnboarding={(message) => { finishOnboarding(message).catch(() => undefined); }}
          onStartFirstSession={handleStartFirstSession}
          selectedPreset={selectedPreset}
        />
      ) : null}
    </OnboardingFlowLayout>
  );
}
export default withScreenErrorBoundary(OnboardingFlowScreen, 'OnboardingFlow');
