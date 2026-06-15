/**
 * EtherealOnboardingShell — shared layout for the OnboardingFlow.
 * Fixed layout zones: safe areas, title, mascot guide, scrollable options, sticky footer.
 */
import React, { type ReactNode, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EtherealSkyBackground } from '../../../../screens/auth/components/ethereal/EtherealSkyBackground';
import { BackgroundScrim } from './BackgroundScrim';
import { StepTransition } from './StepTransition';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingTitle } from './OnboardingTitle';
import { OnboardingFooter } from './OnboardingFooter';
import { OnboardingErrorBanner } from './OnboardingErrorBanner';
import { VexMascotGuide } from './VexMascotGuide';
import { OnboardingCinematicIntro } from './OnboardingCinematicIntro';
import type { MascotMood } from './VexMascotGuide.tokens';
import { useOnboardingStore } from '../../../../features/onboarding/store';

type EtherealOnboardingShellProps = {
  stepKey: string | number;
  step: number;
  lastStepIndex: number;
  isContinueDisabled: boolean;
  isFinishing: boolean;
  finishError: string | null;
  onBack: () => void;
  onContinue: () => void;
  onRetryFinish: () => void;
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  mascotMood?: MascotMood;
  mascotMessage?: string;
  mascotSubmessage?: string;
  mascotReactionKey?: string | number;
};

export function EtherealOnboardingShell({
  stepKey,
  step,
  lastStepIndex,
  isContinueDisabled,
  isFinishing,
  finishError,
  onBack,
  onContinue,
  onRetryFinish,
  children,
  eyebrow,
  title,
  subtitle,
  mascotMood = 'default',
  mascotMessage,
  mascotSubmessage,
  mascotReactionKey,
}: EtherealOnboardingShellProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isLaunchStep = step === lastStepIndex;
  const showBack = step > 0;
  const guideDismissedAt = useOnboardingStore((state) => state.mascotGuideDismissedAt);
  const dismissMascotGuide = useOnboardingStore((state) => state.dismissMascotGuide);
  const [guideReplayCount, setGuideReplayCount] = useState(0);
  const [showStartupCinematic, setShowStartupCinematic] = useState(true);
  const markMascotGuideCompleted = useOnboardingStore(
    (state) => state.markMascotGuideCompleted,
  );
  const showGuide = !guideDismissedAt && !!mascotMessage;

  // Footer height estimate + safe area bottom + gap
  const footerHeight = 118 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <BackgroundScrim intensity="question" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 6,
          paddingBottom: 0,
          paddingHorizontal: 20,
        }}
      >
        {/* Top row: back + eyebrow */}
        <OnboardingHeader eyebrow={eyebrow} onBack={onBack} showBack={showBack} />

        {/* Title block — compact */}
        <View style={{ marginTop: 0, marginBottom: 6, maxHeight: 104 }}>
          <OnboardingTitle subtitle={subtitle} title={title} />
        </View>

        {/* Mascot guide — compact row */}
        {showGuide && mascotMessage ? (
          <View style={{ marginBottom: 8, maxHeight: 118 }}>
            <VexMascotGuide
              message={mascotMessage}
              mood={mascotMood}
              onReplay={() => {
                setGuideReplayCount((value) => value + 1);
              }}
              onSkip={() => {
                dismissMascotGuide();
              }}
              placement="inline"
              reactionKey={`${mascotReactionKey ?? 'guide'}-${guideReplayCount}`}
              size={step === lastStepIndex ? 'confirm' : 'question'}
              submessage={mascotSubmessage}
            />
          </View>
        ) : null}

        {/* Scrollable options area */}
        <StepTransition stepKey={stepKey} style={{ flex: 1, minHeight: 0 }}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: footerHeight + 12,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {finishError ? (
              <OnboardingErrorBanner message={finishError} onRetry={onRetryFinish} />
            ) : null}
            {children}
          </ScrollView>
        </StepTransition>

        {/* Footer CTA — fixed at bottom, never covers scroll content because of paddingBottom */}
        {!isLaunchStep ? (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 20,
              right: 20,
              paddingBottom: insets.bottom + 8,
              paddingTop: 8,
            }}
          >
            <OnboardingFooter
              isContinueDisabled={isContinueDisabled}
              isFinishing={isFinishing}
              onContinue={() => {
                if (step >= lastStepIndex - 1) {
                  markMascotGuideCompleted();
                }
                onContinue();
              }}
            />
          </View>
        ) : null}
      </View>
      {showStartupCinematic ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
          }}
        >
          <EtherealSkyBackground />
          <BackgroundScrim intensity="question" />
          <OnboardingCinematicIntro
            onBegin={() => {
              setShowStartupCinematic(false);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
