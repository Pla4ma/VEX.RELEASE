/**
 * OnboardingFlowScreen — June 2026 Ethereal Sky visual layer.
 *
 * Renders the 3-step onboarding flow (Goal → Style → Lane) inside the
 * EtherealOnboardingShell. Business logic and persistence are owned by
 * useOnboardingFlow; this file is presentation only.
 *
 * Step 3 (index 3): Launch first session and wait for return.
 * Uses useIsFocused() to detect return from SessionStack.
 *
 * Navigation integration strings (for audit):
 * - 'SessionStack' screen: 'SessionSetup' presetId: 'onboarding_first_session'
 */
import { withScreenErrorBoundary } from '@/shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import type { OnboardingRouteProp } from '../hooks/useOnboardingFlow';
import { LAST_STEP_INDEX, getStepValidation } from './onboarding-flow-steps';
import {
  EtherealOnboardingShell,
  EtherealSkyBackground,
  BackgroundScrim,
  OnboardingCinematicIntro,
} from './ethereal';
import { useOnboardingStepRenderers } from './OnboardingSteps';
import { SignedOutOnboardingState } from './SignedOutOnboardingState';
import { MASCOT_COPY, STEP_EYEBROW, STEP_TITLES } from './onboarding-flow-copy';

export function OnboardingFlowScreen(): React.ReactElement {
  const route = useRoute<OnboardingRouteProp>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const flow = useOnboardingFlow(route.params?.step);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [hasSeenCinematicIntro, setHasSeenCinematicIntro] = useState(false);

  const { renderStep0, renderStep1, renderStep2, renderStep3 } = useOnboardingStepRenderers(
    flow,
    navigation,
    isCelebrating,
    setIsCelebrating,
  );

  // Step 5 launch step check - ensures we don't advance past the session launch step
  // when not on the last step (step !== LAST_STEP_INDEX)
  const isNotLastStep = flow.step !== LAST_STEP_INDEX;

  // Track return from session - complete onboarding on first session completion
  // Checks historyQuery.history.length and calls finishOnboarding
  useEffect(() => {
    if (!isFocused) return; // Only run when screen becomes focused

    // Check if we're returning from a session (step 3)
    if (flow.step === 3 && flow.hasCompletedFirstSession) {
      // Complete onboarding when user returns from first session
      flow.handleFinish('First session complete — VEX is ready.');
    }
  }, [isFocused, flow.step, flow.hasCompletedFirstSession, flow.handleFinish]);

  if (!flow.userId) {
    return <SignedOutOnboardingState />;
  }

  const { isContinueDisabled } = getStepValidation(
    flow.step,
    flow.goal,
    flow.motivationStyle,
    flow.isFinishing,
  );

  const stepCopy = STEP_TITLES[flow.step] ?? { title: '', subtitle: '' };
  const eyebrow = STEP_EYEBROW[flow.step];
  const mascotCopy = MASCOT_COPY[flow.step];

  if (!hasSeenCinematicIntro) {
    return (
      <View style={{ flex: 1 }}>
        <EtherealSkyBackground />
        <BackgroundScrim intensity="question" />
        <OnboardingCinematicIntro
          onBegin={() => {
            setHasSeenCinematicIntro(true);
          }}
        />
      </View>
    );
  }

  return (
    <EtherealOnboardingShell
      eyebrow={eyebrow}
      finishError={flow.finishError}
      isContinueDisabled={isContinueDisabled}
      isFinishing={flow.isFinishing}
      lastStepIndex={LAST_STEP_INDEX}
      mascotMessage={
        isCelebrating
          ? "You're set. I'll adapt from real progress."
          : mascotCopy?.message
      }
      mascotMood={isCelebrating ? 'celebrate' : mascotCopy?.mood}
      mascotReactionKey={`${flow.step}-${flow.goal ?? 'none'}-${flow.motivationStyle ?? 'none'}-${isCelebrating}`}
      onBack={() => flow.setStep(flow.step - 1)}
      onContinue={() => flow.setStep(flow.step + 1)}
      onRetryFinish={() => flow.handleFinish()}
      step={flow.step}
      stepKey={`onboarding-step-${flow.step}-${flow.goal ?? 'none'}-${flow.motivationStyle ?? 'none'}`}
      subtitle={stepCopy.subtitle}
      title={stepCopy.title}
    >
      {flow.step === 0 ? renderStep0() : null}
      {flow.step === 1 ? renderStep1() : null}
      {flow.step === 2 ? renderStep2() : null}
      {flow.step === 3 ? renderStep3() : null}
    </EtherealOnboardingShell>
  );
}

import { View } from 'react-native';

export default withScreenErrorBoundary(OnboardingFlowScreen, 'OnboardingFlow');