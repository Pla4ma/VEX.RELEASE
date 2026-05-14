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
import {
  DEFAULT_COMPANION_ELEMENT,
  DEFAULT_PERSONA_ID,
  GoalStep,
  LauncherStep,
  OnboardingFlowLayout,
  SignedOutOnboardingState,
  STARTER_PRESETS,
  STEP_TITLES,
  StarterStep,
} from './components';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;
type OnboardingRouteProp = RouteProp<ExtendedRootStackParams, 'Onboarding'>;

const LAST_STEP_INDEX = STEP_TITLES.length - 1;

function clampStep(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), LAST_STEP_INDEX);
}

export function OnboardingFlowScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OnboardingRouteProp>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const draft = useOnboardingStore((state) => (userId ? state.getDraft(userId) : undefined));
  const saveDraft = useOnboardingStore((state) => state.saveDraft);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const showHomeHighlight = useSessionUIStore((state) => state.showHomeHighlight);
  const disclosureAnalytics = useDisclosureAnalytics();
  const [step, setStep] = useState(clampStep(route.params?.step));
  const [goal, setGoal] = useState<OnboardingGoal | undefined>(draft?.goal);
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

  const selectedGoal = useMemo(() => ONBOARDING_GOALS.find((item) => item.id === goal), [goal]);
  const selectedPreset = useMemo(
    () => STARTER_PRESETS.find((preset) => preset.id === starterPresetId),
    [starterPresetId],
  );

  const persistDraft = useCallback((): void => {
    if (!userId) {
      return;
    }
    saveDraft(userId, {
      element: DEFAULT_COMPANION_ELEMENT,
      goal,
      personaId: DEFAULT_PERSONA_ID,
      squadId: null,
      starterPresetId,
    });
  }, [goal, saveDraft, starterPresetId, userId]);

  useEffect(() => {
    if (!userId || startedTrackedRef.current) {
      return;
    }
    startedTrackedRef.current = true;
    disclosureAnalytics.trackOnboardingStarted(userId);
  }, [disclosureAnalytics, userId]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft, step]);

  useEffect(() => {
    navigation.setParams({ step });
  }, [navigation, step]);

  useEffect(() => {
    if (!isFocused || step !== LAST_STEP_INDEX || completedRef.current) {
      return;
    }
    if (historyQuery.history.length === 0) {
      return;
    }
    setHasSeenFirstWin(true);

    if (!firstSessionCompletedTrackedRef.current && userId) {
      firstSessionCompletedTrackedRef.current = true;
      disclosureAnalytics.trackOnboardingFirstSessionCompleted(userId);
    }
  }, [disclosureAnalytics, historyQuery.history.length, isFocused, step, userId]);

  const finishOnboarding = useCallback(async (message?: string): Promise<void> => {
    if (!userId || !goal || !starterPresetId) {
      return;
    }
    setIsFinishing(true);
    setFinishError(null);
    completedRef.current = true;

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
    } finally {
      setIsFinishing(false);
    }
  }, [completeOnboarding, disclosureAnalytics, goal, navigation, showHomeHighlight, starterPresetId, userId]);

  const handleSelectGoal = useCallback((nextGoal: OnboardingGoal): void => {
    setGoal(nextGoal);
    if (userId) {
      disclosureAnalytics.trackOnboardingGoalSet(userId, nextGoal);
    }
  }, [disclosureAnalytics, userId]);

  const handleStartFirstSession = useCallback((): void => {
    if (!selectedPreset) {
      return;
    }
    setIsLaunchingSession(true);
    triggerHaptic('impactMedium').catch(() => undefined);
    disclosureAnalytics.trackFirstSessionStarted(userId, 'onboarding');
    navigation.navigate('SessionStack', {
      screen: 'SessionSetup',
      params: { goal: selectedGoal?.label, presetId: selectedPreset.id, source: 'onboarding_first_session' },
    });
    setIsLaunchingSession(false);
  }, [disclosureAnalytics, navigation, selectedGoal?.label, selectedPreset, userId]);

  if (!userId) {
    return <SignedOutOnboardingState />;
  }

  return (
    <OnboardingFlowLayout
      finishError={finishError}
      isContinueDisabled={(step === 0 && !goal) || isFinishing}
      isFinishing={isFinishing}
      lastStepIndex={LAST_STEP_INDEX}
      onBack={() => setStep(step - 1)}
      onContinue={() => setStep(step + 1)}
      onRetryFinish={() => { finishOnboarding().catch(() => undefined); }}
      step={step}
    >
      {step === 0 ? <GoalStep goal={goal} onSelectGoal={handleSelectGoal} /> : null}
      {step === 1 ? <StarterStep starterPresetId={starterPresetId} onSelectPreset={setStarterPresetId} /> : null}
      {step === 2 ? (
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
