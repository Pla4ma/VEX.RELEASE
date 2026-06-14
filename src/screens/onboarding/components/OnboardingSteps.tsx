import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { FloatingChoiceCard } from './ethereal';
import { LaneChoiceStep } from './LaneChoiceStep';
import { LaneConfirmationStep } from './LaneConfirmationStep';
import { MOTIVATION_STYLE_OPTIONS } from './onboarding-flow-data';
import { ONBOARDING_GOALS } from '@/features/onboarding';
import type { MotivationProfileType } from '@/features/onboarding';
import type { Lane } from '@/features/lane-engine';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { LAST_STEP_INDEX, getStepValidation } from '../onboarding-flow-steps';
import { MASCOT_COPY, STEP_EYEBROW, STEP_TITLES, GUIDE_COPY } from '../onboarding-flow-copy';
import { etherealText } from '@/theme/tokens/ethereal-sky';

export interface UseOnboardingStepRenderersReturn {
  renderStep0: () => React.ReactElement;
  renderStep1: () => React.ReactElement;
  renderStep2: () => React.ReactElement;
  renderStep3: () => React.ReactElement;
}

export function useOnboardingStepRenderers(
  flow: ReturnType<typeof useOnboardingFlow>,
  navigation: any,
  isCelebrating: boolean,
  setIsCelebrating: (v: boolean) => void,
): UseOnboardingStepRenderersReturn {
  const choiceWrapStyle = { gap: 8, marginTop: 2 };

  const handleAccept = useCallback(
    (lane: Lane) => {
      setIsCelebrating(true);
      window.__ONBOARDING_LANE_CHOSEN__ = true;
      setTimeout(() => {
        flow.handleAcceptLaneAndAdvance(lane);
      }, 900);
    },
    [flow, setIsCelebrating],
  );

  const handleStartFirstSession = useCallback(() => {
    flow.startFirstSession();
  }, [flow]);

  const renderStep0 = useCallback(() => (
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
  ), [choiceWrapStyle, flow]);

  const renderStep1 = useCallback(() => (
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
  ), [choiceWrapStyle, flow]);

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

  const renderStep3 = useCallback(() => {
    const guideCopy = GUIDE_COPY[flow.step];
    return (
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
    );
  }, [flow, handleStartFirstSession]);

  return { renderStep0, renderStep1, renderStep2, renderStep3 };
}