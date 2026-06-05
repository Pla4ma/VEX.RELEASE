/**
 * EtherealOnboardingShell — shared layout for the OnboardingFlow:
 * full-bleed EtherealSkyBackground, persistent HeroOrb, header,
 * step content with shared-axis transition, and footer.
 *
 * Header / title / footer / error are split into their own files
 * for size discipline; this file is a thin orchestrator.
 */
import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EtherealSkyBackground } from '../../../../screens/auth/components/ethereal/EtherealSkyBackground';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { HeroOrb } from './HeroOrb';
import { StepTransition } from './StepTransition';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingTitle } from './OnboardingTitle';
import { OnboardingFooter } from './OnboardingFooter';
import { OnboardingErrorBanner } from './OnboardingErrorBanner';

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
}: EtherealOnboardingShellProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { isReducedMotion } = useReducedMotion();
  const isLaunchStep = step === lastStepIndex;
  const showBack = step > 0;

  const orbAnchor = { x: 0.5, y: isLaunchStep ? 0.35 : 0.18 } as const;

  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />

      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
      >
        <HeroOrb
          anchorX={orbAnchor.x}
          anchorY={orbAnchor.y}
          size={isReducedMotion ? 80 : 96}
        />
      </View>

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
        }}
      >
        <OnboardingHeader eyebrow={eyebrow} onBack={onBack} showBack={showBack} />

        <OnboardingTitle subtitle={subtitle} title={title} />

        <StepTransition stepKey={stepKey} style={{ flex: 1, marginTop: 8 }}>
          {finishError ? (
            <OnboardingErrorBanner message={finishError} onRetry={onRetryFinish} />
          ) : null}
          {children}
        </StepTransition>

        {!isLaunchStep ? (
          <OnboardingFooter
            isContinueDisabled={isContinueDisabled}
            isFinishing={isFinishing}
            onContinue={onContinue}
          />
        ) : null}
      </View>
    </View>
  );
}
