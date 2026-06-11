/**
 * EtherealOnboardingShell — shared layout for the OnboardingFlow.
 * Fixed layout zones: safe areas, title, mascot guide, scrollable options, sticky footer.
 */
import React, { type ReactNode } from 'react';
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
import type { MascotMood } from './VexMascotGuide.tokens';
import { useOnboardingStore } from '../../../../features/onboarding';

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
}: EtherealOnboardingShellProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isLaunchStep = step === lastStepIndex;
  const showBack = step > 0;
  const guideDismissedAt = useOnboardingStore((state) => state.mascotGuideDismissedAt);
  const dismissMascotGuide = useOnboardingStore((state) => state.dismissMascotGuide);
  const markMascotGuideCompleted = useOnboardingStore(
    (state) => state.markMascotGuideCompleted,
  );
  const showGuide = !guideDismissedAt && !!mascotMessage;

  // Footer height estimate + safe area bottom + gap
  const footerHeight = 76 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <BackgroundScrim intensity="question" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          paddingBottom: 0,
          paddingHorizontal: 24,
        }}
      >
        {/* Top row: back + eyebrow */}
        <OnboardingHeader eyebrow={eyebrow} onBack={onBack} showBack={showBack} />

        {/* Title block — compact */}
        <View style={{ marginTop: 4, marginBottom: 8, maxHeight: 140 }}>
          <OnboardingTitle subtitle={subtitle} title={title} />
        </View>

        {/* Mascot guide — compact row */}
        {showGuide && mascotMessage ? (
          <View style={{ marginBottom: 10, maxHeight: 120 }}>
            <VexMascotGuide
              message={mascotMessage}
              mood={mascotMood}
              onBack={showBack ? onBack : undefined}
              onReplay={() => {}}
              onSkip={() => {
                dismissMascotGuide();
              }}
              placement="inline"
              size="question"
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
              left: 24,
              right: 24,
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
    </View>
  );
}
