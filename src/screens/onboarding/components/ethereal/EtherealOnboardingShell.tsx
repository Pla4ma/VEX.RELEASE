/**
 * EtherealOnboardingShell — shared layout for the OnboardingFlow:
 * full-bleed EtherealSkyBackground, persistent HeroOrb, header,
 * step content with shared-axis transition, and footer.
 *
 * Header / title / footer / error are split into their own files
 * for size discipline; this file is a thin orchestrator.
 */
import React, { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EtherealSkyBackground } from '../../../../screens/auth/components/ethereal/EtherealSkyBackground';
import { StepTransition } from './StepTransition';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingTitle } from './OnboardingTitle';
import { OnboardingFooter } from './OnboardingFooter';
import { OnboardingErrorBanner } from './OnboardingErrorBanner';
import { MascotGuide } from './MascotGuide';
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
  guideTitle?: string;
  guideBody?: string;
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
  guideTitle,
  guideBody,
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

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
        }}
      >
        <OnboardingHeader eyebrow={eyebrow} onBack={onBack} showBack={showBack} />

        <OnboardingTitle subtitle={subtitle} title={title} />

        {showGuide && guideTitle && guideBody ? (
          <View style={{ marginTop: 12 }}>
            <MascotGuide
              body={guideBody}
              compact
              onBack={showBack ? onBack : undefined}
              onReplay={() => setShowGuide(true)}
              onSkip={() => {
                dismissMascotGuide();
                setShowGuide(false);
              }}
              stepLabel={eyebrow}
              title={guideTitle}
            />
          </View>
        ) : guideTitle ? (
          <ReplayGuideButton onPress={() => setShowGuide(true)} />
        ) : null}

        <StepTransition stepKey={stepKey} style={{ flex: 1, marginTop: 8 }}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: isLaunchStep ? 24 : 116,
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
          <OnboardingFooter
            isContinueDisabled={isContinueDisabled}
            isFinishing={isFinishing}
            onContinue={() => {
              if (step >= lastStepIndex - 1) {markMascotGuideCompleted();}
              onContinue();
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function ReplayGuideButton({ onPress }: { onPress: () => void }): React.JSX.Element {
  return (
    <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
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
    </View>
  );
}
