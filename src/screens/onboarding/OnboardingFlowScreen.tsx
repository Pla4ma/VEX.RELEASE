import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { useRoute } from '@react-navigation/native';
import {
  GoalStep,
  LaneConfirmationStep,
  LaneChoiceStep,
  LauncherStep,
  MotivationStyleStep,
  OnboardingFlowLayout,
  SignedOutOnboardingState,
  StarterStep,
} from './components';
import { LAST_STEP_INDEX, getStepValidation } from './onboarding-flow-steps';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import type { OnboardingRouteProp } from './hooks/useOnboardingFlow';

export function OnboardingFlowScreen(): JSX.Element {
  const route = useRoute<OnboardingRouteProp>();
  const flow = useOnboardingFlow(route.params?.step);

  if (!flow.userId) {return <SignedOutOnboardingState />;}

  const { isContinueDisabled } = getStepValidation(
    flow.step,
    flow.goal,
    flow.motivationStyle,
    flow.isFinishing,
  );

  return (
    <OnboardingFlowLayout
      finishError={flow.finishError}
      isContinueDisabled={isContinueDisabled}
      isFinishing={flow.isFinishing}
      lastStepIndex={LAST_STEP_INDEX}
      onBack={() => flow.setStep(flow.step - 1)}
      onContinue={() => flow.setStep(flow.step + 1)}
      onRetryFinish={() => flow.handleFinish()}
      step={flow.step}
    >
      {flow.step === 0 ? (
        <GoalStep goal={flow.goal} onSelectGoal={flow.handleSelectGoal} />
      ) : null}
      {flow.step === 1 ? (
        <MotivationStyleStep
          goal={flow.goal}
          motivationStyle={flow.motivationStyle}
          onSelectStyle={flow.handleSelectMotivationStyle}
        />
      ) : null}
      {flow.step === 2 ? (
        flow.isChoosingLane ? (
          <LaneChoiceStep onSelect={flow.handleSelectLane} />
        ) : (
          <LaneConfirmationStep
            confirmation={flow.laneConfirmation}
            isChoosing={false}
            onAccept={flow.handleAcceptLaneAndAdvance}
            onChooseAnother={flow.handleChooseAnotherLane}
          />
        )
      ) : null}
      {flow.step === 3 ? (
        <StarterStep
          starterPresetId={flow.starterPresetId}
          onSelectPreset={flow.setStarterPresetId}
        />
      ) : null}
      {flow.step === 4 ? (
        <LauncherStep
          firstSessionXp={
            flow.historyQuery.history[0]?.summary?.xpEarned ?? 50
          }
          hasSeenFirstWin={flow.hasSeenFirstWin}
          isFinishing={flow.isFinishing}
          isLaunchingSession={flow.isLaunchingSession}
          onFinishOnboarding={(message) => flow.handleFinish(message)}
          onStartFirstSession={flow.handleStartFirstSession}
          selectedPreset={flow.selectedPreset}
        />
      ) : null}
    </OnboardingFlowLayout>
  );
}

export default withScreenErrorBoundary(OnboardingFlowScreen, 'OnboardingFlow');
