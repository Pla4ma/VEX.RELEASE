/**
 * OnboardingFlowScreen — June 2026 Ethereal Sky visual layer.
 *
 * Renders the 3-step onboarding flow (Goal → Style → Lane) inside the
 * EtherealOnboardingShell. Business logic and persistence are owned by
 * useOnboardingFlow; this file is presentation only.
 */
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { etherealText } from '@/theme/tokens/ethereal-sky';

import { ONBOARDING_GOALS } from '../../features/onboarding';
import { Text } from '../../components/primitives/Text';
import {
  MOTIVATION_STYLE_OPTIONS,
} from './components/onboarding-flow-data';
import type { MotivationProfileType } from '../../features/onboarding';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import type { OnboardingRouteProp } from './hooks/useOnboardingFlow';
import { LAST_STEP_INDEX, getStepValidation } from './onboarding-flow-steps';
import {
  EtherealOnboardingShell,
  EtherealSkyBackground,
  BackgroundScrim,
  FloatingChoiceCard,
  OnboardingCinematicIntro,
  SerifTitle,
} from './components/ethereal';
import { LaneChoiceStep } from './components/LaneChoiceStep';
import { LaneConfirmationStep } from './components/LaneConfirmationStep';
import type { Lane } from '../../features/lane-engine';
import { MASCOT_COPY, STEP_EYEBROW, STEP_TITLES } from './onboarding-flow-copy';

export function OnboardingFlowScreen(): JSX.Element {
  const route = useRoute<OnboardingRouteProp>();
  const flow = useOnboardingFlow(route.params?.step);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [hasSeenCinematicIntro, setHasSeenCinematicIntro] = useState(false);
  const choiceWrapStyle = { gap: 8, marginTop: 2 };

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
  const mascotCopy = MASCOT_COPY[flow.step];

  const handleAccept = useCallback((lane: Lane) => {
    setIsCelebrating(true);
    setTimeout(() => {
      flow.handleAcceptLaneAndAdvance(lane);
    }, 900);
  }, [flow]);

  const renderStep0 = useCallback(
    () => (
      <View style={choiceWrapStyle}>
        {ONBOARDING_GOALS.map((g, i) => (
          <FloatingChoiceCard
            key={g.id}
            accessibilityHint={`Selects ${g.label} as your first focus goal`}
            body={g.description}
            delayMs={120}
            disabled={flow.isFinishing}
            index={i}
            onPress={() => flow.handleSelectGoal(g.id)}
            selected={flow.goal === g.id}
            title={g.label}
          />
        ))}
      </View>
    ),
    [choiceWrapStyle, flow],
  );

  const renderStep1 = useCallback(
    () => (
      <View style={choiceWrapStyle}>
        {MOTIVATION_STYLE_OPTIONS.map((style, i) => (
          <FloatingChoiceCard
            key={style.id}
            accessibilityHint={`Selects ${style.title} as your motivation style`}
            body={style.description}
            delayMs={120}
            disabled={flow.isFinishing}
            index={i}
            onPress={() => flow.handleSelectMotivationStyle(style.id as MotivationProfileType)}
            selected={flow.motivationStyle === style.id}
            title={style.title}
          />
        ))}
      </View>
    ),
    [choiceWrapStyle, flow],
  );

  const renderStep2 = useCallback(
    () =>
      flow.isChoosingLane ? (
        <View style={{ marginTop: 8 }}>
          <LaneChoiceStep onSelect={flow.handleSelectLane} />
        </View>
      ) : (
        <View style={{ marginTop: 8 }}>
          <LaneConfirmationStep
            celebrating={isCelebrating}
            confirmation={flow.laneConfirmation}
            isChoosing={false}
            onAccept={handleAccept}
            onChooseAnother={flow.handleChooseAnotherLane}
          />
        </View>
      ),
    [flow, isCelebrating, handleAccept],
  );

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
      eyebrow={STEP_EYEBROW[flow.step]}
      finishError={flow.finishError}
      isContinueDisabled={isContinueDisabled}
      isFinishing={flow.isFinishing}
      lastStepIndex={LAST_STEP_INDEX}
      mascotMessage={isCelebrating ? "You're set. I'll adapt from real progress." : mascotCopy?.message}
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
    </EtherealOnboardingShell>
  );
}

function SignedOutOnboardingState(): JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        <SerifTitle
          color={etherealText.heading}
          fontSize={28}
          letterSpacing={-0.5}
          lineHeight={34}
          text="Sign in to start"
        />
        <Text
          color={etherealText.heading}
          fontSize={14}
          style={{ color: etherealText.body, textAlign: 'center' }}
        >
          Your onboarding picks up where you left off once you sign in.
        </Text>
      </View>
    </View>
  );
}

export default withScreenErrorBoundary(OnboardingFlowScreen, 'OnboardingFlow');
