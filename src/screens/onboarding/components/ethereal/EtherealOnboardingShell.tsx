/**
 * EtherealOnboardingShell — shared layout for the OnboardingFlow.
 * Fixed layout: safe areas, sticky CTA, compact guide, no clipping.
 */
import React, { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EtherealSkyBackground } from '../../../../screens/auth/components/ethereal/EtherealSkyBackground';
import { BackgroundScrim } from './BackgroundScrim';
import { StepTransition } from './StepTransition';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingTitle } from './OnboardingTitle';
import { OnboardingFooter } from './OnboardingFooter';
import { OnboardingErrorBanner } from './OnboardingErrorBanner';
import { VexMascotGuide } from './VexMascotGuide';
import type { MascotMood } from './VexMascotGuide';
import { Text } from '../../../../components/primitives/Text';
import { useOnboardingStore } from '../../../../features/onboarding';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

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
  const [showGuide, setShowGuide] = useState(!guideDismissedAt);

  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <BackgroundScrim intensity="question" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
          paddingHorizontal: 24,
        }}
      >
        <OnboardingHeader eyebrow={eyebrow} onBack={onBack} showBack={showBack} />

        <OnboardingTitle subtitle={subtitle} title={title} />

        {showGuide && mascotMessage ? (
          <View style={{ marginTop: 10, marginBottom: 8 }}>
            <VexMascotGuide
              message={mascotMessage}
              mood={mascotMood}
              onBack={showBack ? onBack : undefined}
              onReplay={() => setShowGuide(true)}
              onSkip={() => {
                dismissMascotGuide();
                setShowGuide(false);
              }}
              placement="inline"
              size="medium"
              stepLabel={eyebrow}
              submessage={mascotSubmessage}
            />
          </View>
        ) : mascotMessage ? (
          <View style={{ marginTop: 8, marginBottom: 4, alignItems: 'flex-end' }}>
            <ReplayGuideButton onPress={() => setShowGuide(true)} />
          </View>
        ) : null}

        <StepTransition stepKey={stepKey} style={{ flex: 1, marginTop: 4 }}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: isLaunchStep ? 24 : 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {finishError ? (
              <OnboardingErrorBanner message={finishError} onRetry={onRetryFinish} />
            ) : null}
            {children}
          </ScrollView>
        </StepTransition>

        {!isLaunchStep ? (
          <View style={{ position: 'absolute', bottom: 0, left: 24, right: 24 }}>
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

function ReplayGuideButton({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint="Shows the mascot guide again"
      accessibilityLabel="Replay mascot guide"
      accessibilityRole="button"
      onPress={onPress}
      style={getMinTouchTargetStyle()}
    >
      <Text
        fontSize={12}
        fontWeight="800"
        style={{ color: etherealButton.emailText }}
      >
        Replay guide
      </Text>
    </Pressable>
  );
}
