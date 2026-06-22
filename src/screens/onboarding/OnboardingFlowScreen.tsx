import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import type { OnboardingRouteProp } from './hooks/useOnboardingFlow';
import { LAST_STEP_INDEX, getStepValidation } from './onboarding-flow-steps';
import {
  EtherealOnboardingShell,
  EtherealSkyBackground,
  BackgroundScrim,
  OnboardingCinematicIntro,
} from './components/ethereal';
import { SignedOutOnboardingState } from './components/SignedOutOnboardingState';
import { STEP_TITLES, STEP_EYEBROW, MASCOT_COPY } from './onboarding-flow-copy';
import type { Lane } from '../../features/lane-engine';
import {
  Step0Renderer,
  Step1Renderer,
  Step2Renderer,
  Step3Renderer,
  type StepRenderersConfig,
} from './components/OnboardingStepRenderers';

export function OnboardingFlowScreen(): React.ReactNode {
  const route = useRoute<OnboardingRouteProp>();
  const isFocused = useIsFocused();
  const flow = useOnboardingFlow(route.params?.step);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [hasSeenCinematicIntro, setHasSeenCinematicIntro] = useState(false);

  const handleAccept = useCallback((lane: Lane) => {
    setIsCelebrating(true);
    (window).__ONBOARDING_LANE_CHOSEN__ = true;
    setTimeout(() => {
      flow.handleAcceptLaneAndAdvance(lane);
    }, 900);
  }, [flow]);

  const handleStartFirstSession = useCallback(() => {
    flow.startFirstSession();
  }, [flow]);

  useEffect(() => {
    if (!isFocused) return;
    if (flow.step === 3 && flow.hasCompletedFirstSession) {
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

  const rendererProps: StepRenderersConfig = {
    flow: {
      isFinishing: flow.isFinishing,
      goal: flow.goal,
      motivationStyle: flow.motivationStyle,
      step: flow.step,
      isChoosingLane: flow.isChoosingLane,
      laneConfirmation: flow.laneConfirmation,
      handleSelectGoal: flow.handleSelectGoal as (id: string) => void,
      handleSelectMotivationStyle: flow.handleSelectMotivationStyle,
      handleSelectLane: flow.handleSelectLane,
      handleAcceptLaneAndAdvance: flow.handleAcceptLaneAndAdvance,
      handleChooseAnotherLane: flow.handleChooseAnotherLane,
      startFirstSession: flow.startFirstSession,
    },
    isCelebrating,
    handleAccept,
    handleStartFirstSession,
  };

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
      {flow.step === 0 && <Step0Renderer {...rendererProps} />}
      {flow.step === 1 && <Step1Renderer {...rendererProps} />}
      {flow.step === 2 && <Step2Renderer {...rendererProps} />}
      {flow.step === 3 && <Step3Renderer {...rendererProps} />}
    </EtherealOnboardingShell>
  );
}

const OnboardingFlowScreenWithBoundary = withScreenErrorBoundary(OnboardingFlowScreen, 'OnboardingFlow');
export { OnboardingFlowScreenWithBoundary as OnboardingFlowScreen };
