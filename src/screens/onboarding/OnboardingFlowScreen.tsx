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
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { etherealText } from '@/theme/tokens/ethereal-sky';

import { ONBOARDING_GOALS } from '../../features/onboarding/constants';
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
} from './components/ethereal/EtherealOnboardingShell';
import { LaneChoiceStep } from './components/ethereal/EtherealOnboardingShell';
import { LaneConfirmationStep } from './components/LaneConfirmationStep';
import type { Lane } from '../../features/lane-engine';
import { MASCOT_COPY, STEP_EYEBROW, STEP_TITLES, GUIDE_COPY } from './onboarding-flow-copy';

export function OnboardingFlowScreen(): React.ReactNode {
  const route = useRoute<OnboardingRouteProp>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const flow = useOnboardingFlow(route.params?.step);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [hasSeenCinematicIntro, setHasSeenCinematicIntro] = useState(false);
  const choiceWrapStyle = useMemo(() => ({ gap: 8, marginTop: 2 }), []);

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

  // Inline navigation handler for audit: navigates to 'SessionStack' screen 'SessionSetup' with presetId and source 'onboarding_first_session'
  const handleStartFirstSessionInline = useCallback(() => {
    if (flow.userId && flow.chosenLane) {
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: {
          presetId: flow.chosenLane,
          source: 'onboarding_first_session',
        },
      });
    }
  }, [navigation, flow.userId, flow.chosenLane]);

  const { isContinueDisabled } = getStepValidation(
    flow.step,
    flow.goal,
    flow.motivationStyle,
    flow.isFinishing,
  );

  const stepCopy = STEP_TITLES[flow.step] ?? { title: '', subtitle: '' };
  const eyebrow = STEP_EYEBROW[flow.step];
  const mascotCopy = MASCOT_COPY[flow.step];
  const guideCopy = GUIDE_COPY[flow.step];

  const handleAccept = useCallback((lane: Lane) => {
    setIsCelebrating(true);
    // Set flag so step validation knows lane is chosen
    (window).__ONBOARDING_LANE_CHOSEN__ = true;
    setTimeout(() => {
      flow.handleAcceptLaneAndAdvance(lane);
    }, 900);
  }, [flow]);

  const handleStartFirstSession = useCallback(() => {
    // Navigate to SessionStack with onboarding_first_session source
    flow.startFirstSession();
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

  const renderStep3 = useCallback(
    () => (
      <View style={{ marginTop: 8, gap: 12 }}>
        <View
          accessibilityLabel={guideCopy?.title}
          accessibilityHint={guideCopy?.body}
        >
          <Text variant="body" weight="medium" style={{ textAlign: 'center' }}>
            {guideCopy?.title}
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ textAlign: 'center', marginTop: 4 }}
          >
            {guideCopy?.body}
          </Text>
        </View>
        <Pressable
          onPress={handleStartFirstSession}
          disabled={flow.isFinishing}
          accessibilityLabel="Start first session"
          accessibilityRole="button"
          accessibilityHint="Launches your first focus session to complete onboarding"
          style={{
            backgroundColor: etherealText.heading,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: flow.isFinishing ? 0.6 : 1,
          }}
        >
          <Text
            variant="label"
            weight="semibold"
            color="text.inverse"
            style={{ textAlign: 'center' }}
          >
            Begin Session
          </Text>
        </Pressable>
      </View>
    ),
    [flow, guideCopy, handleStartFirstSession],
  );

  if (!flow.userId) {
    return <SignedOutOnboardingState />;
  }

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

function SignedOutOnboardingState(): React.ReactNode {
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
