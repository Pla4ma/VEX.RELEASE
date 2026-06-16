import React from 'react';
import { View } from 'react-native';

import { FloatingChoiceCard } from './ethereal';
import { ONBOARDING_GOALS } from '../../../features/onboarding';
import { MOTIVATION_STYLE_OPTIONS } from './onboarding-flow-data';
import type { MotivationProfileType } from '../../../features/onboarding';
import { LaneChoiceStep } from './LaneChoiceStep';
import { LaneConfirmationStep } from './LaneConfirmationStep';
import { GUIDE_COPY } from '../onboarding-flow-copy';
import { etherealText } from '@/theme/tokens/ethereal-sky';
import { Text } from '../../../components/primitives/Text';
import type { Lane, LaneConfirmation } from '../../../features/lane-engine';

export interface StepRenderersConfig {
  flow: {
    isFinishing: boolean;
    goal: string | null | undefined;
    motivationStyle: string | null | undefined;
    step: number;
    isChoosingLane: boolean;
    laneConfirmation: LaneConfirmation | null;
    handleSelectGoal: (id: string) => void;
    handleSelectMotivationStyle: (id: MotivationProfileType) => void;
    handleSelectLane: (lane: Lane) => void;
    handleAcceptLaneAndAdvance: (lane: Lane) => void;
    handleChooseAnotherLane: () => void;
    startFirstSession: () => void;
  };
  isCelebrating: boolean;
  handleAccept: (lane: Lane) => void;
  handleStartFirstSession: () => void;
}

export function Step0Renderer({ flow }: StepRenderersConfig) {
  return (
    <View style={{ gap: 8, marginTop: 2 }}>
      {ONBOARDING_GOALS.map((g: { id: string; label: string; description: string }, i: number) => (
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
  );
}

export function Step1Renderer({ flow }: StepRenderersConfig) {
  return (
    <View style={{ gap: 8, marginTop: 2 }}>
      {MOTIVATION_STYLE_OPTIONS.map((style: { id: string; title: string; description: string }, i: number) => (
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
  );
}

export function Step2Renderer({ flow, isCelebrating, handleAccept }: StepRenderersConfig) {
  if (flow.isChoosingLane) {
    return (
      <View style={{ marginTop: 8 }}>
        <LaneChoiceStep onSelect={flow.handleSelectLane} />
      </View>
    );
  }
  return (
    <View style={{ marginTop: 8 }}>
      <LaneConfirmationStep
        celebrating={isCelebrating}
        confirmation={flow.laneConfirmation}
        isChoosing={false}
        onAccept={handleAccept}
        onChooseAnother={flow.handleChooseAnotherLane}
      />
    </View>
  );
}

export function Step3Renderer({ flow, handleStartFirstSession }: StepRenderersConfig) {
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
      <View
        accessibilityLabel="Start first session"
        accessibilityRole="button"
        accessibilityHint="Launches your first focus session to complete onboarding"
        onTouchEnd={handleStartFirstSession}
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
      </View>
    </View>
  );
}