import React, { useMemo, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmartCoachHint } from '../../../components/coach/SmartCoachHint';
import { PremiumSurface } from '../../../components/premium';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { styles } from '../styles';
import { ONBOARDING_PROMISE_COPY, STEP_TITLES } from './onboarding-flow-data';
import {
  getProgressPhaseIndex,
  OnboardingProgressIndicator,
} from './OnboardingProgressIndicator';

type OnboardingFlowLayoutProps = {
  children: ReactNode;
  finishError: string | null;
  isContinueDisabled: boolean;
  isFinishing: boolean;
  lastStepIndex: number;
  onBack: () => void;
  onContinue: () => void;
  onRetryFinish: () => void;
  step: number;
};

function getCoachCue(step: number): { title: string; body: string } {
  const fallback = {
    title: 'We will keep the experience responsive.',
    body: 'If a signal is still syncing, you will see the usable state first and deeper insights as they arrive.',
  };
  const cues = [
    {
      title: 'I will tune VEX around how you focus.',
      body: 'Pick the honest answer. The app adapts the first session, study surfaces, and reminders from this setup.',
    },
    {
      title: 'This shapes how VEX adapts to you.',
      body: 'VEX will highlight the next best action instead of making you hunt through menus.',
    },
    fallback,
  ];
  return cues[step] ?? fallback;
}

export function SignedOutOnboardingState(): JSX.Element {
  const { theme } = useTheme();
  const centeredScreenStyle = useMemo(
    () => [styles.centeredScreen, { backgroundColor: theme.colors.background.primary }],
    [theme.colors.background.primary],
  );
  const signedOutTextStyle = useMemo(
    () => ({ color: theme.colors.text.primary }),
    [theme.colors.text.primary],
  );

  return (
    <View style={centeredScreenStyle}>
      <Text style={signedOutTextStyle}>Sign in to start onboarding.</Text>
    </View>
  );
}

export function OnboardingFlowLayout({
  children,
  finishError,
  isContinueDisabled,
  isFinishing,
  lastStepIndex,
  onBack,
  onContinue,
  onRetryFinish,
  step,
}: OnboardingFlowLayoutProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isLaunchStep = step === lastStepIndex;
  const activePhase = getProgressPhaseIndex(step, lastStepIndex);
  const screenStyle = useMemo(
    () => [styles.screen, { backgroundColor: theme.colors.background.primary }],
    [theme.colors.background.primary],
  );
  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      {
        flex: isLaunchStep ? 1 : undefined,
        paddingBottom: isLaunchStep ? 0 : theme.spacing[8],
        paddingHorizontal: theme.spacing[5],
        paddingTop: insets.top + theme.spacing[6],
      },
    ],
    [insets.top, isLaunchStep, theme.spacing],
  );
  const footerStyle = useMemo(
    () => [
      styles.footer,
      {
        backgroundColor: theme.colors.background.primary,
        borderTopColor: theme.colors.border.DEFAULT,
        paddingBottom: insets.bottom + theme.spacing[4],
        paddingHorizontal: theme.spacing[5],
        paddingTop: theme.spacing[4],
      },
    ],
    [insets.bottom, theme.colors.background.primary, theme.colors.border.DEFAULT, theme.spacing],
  );

  const stepContent = (
    <>
      <View style={scrollContentStyle}>
        {isLaunchStep ? null : (
          <>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {step === 0 ? ONBOARDING_PROMISE_COPY.primary : STEP_TITLES[step]}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}>
              {step === 0 ? ONBOARDING_PROMISE_COPY.secondary : getCoachCue(step).body}
            </Text>
            <OnboardingProgressIndicator phaseIndex={activePhase} />
            <SmartCoachHint
              body={step === 0 ? 'Pick the honest answer. VEX will adapt the first session around it.' : getCoachCue(step).body}
              mood={step === lastStepIndex - 1 ? 'celebrate' : 'active'}
              title={getCoachCue(step).title}
            />
          </>
        )}
        {finishError ? (
          <PremiumSurface
            actionLabel="Try again"
            body="Your choices are still saved. Retrying will attempt to finish onboarding without resetting anything."
            eyebrow="Setup status"
            onAction={onRetryFinish}
            title={finishError}
            tone="warning"
          />
        ) : null}
        {children}
      </View>
      {!isLaunchStep ? (
        <View style={footerStyle}>
          {step > 0 ? (
            <Button
              accessibilityHint="Returns to the previous onboarding step"
              accessibilityLabel="Back"
              accessibilityRole="button"
              onPress={onBack}
              variant="ghost"
            >
              Back
            </Button>
          ) : <View />}
          <Button
            accessibilityHint="Moves to the next onboarding step"
            accessibilityLabel="Continue"
            accessibilityRole="button"
            isDisabled={isContinueDisabled}
            isLoading={isFinishing}
            onPress={onContinue}
          >
            Continue
          </Button>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={screenStyle}>
      {isLaunchStep ? (
        <View style={styles.screen}>{stepContent}</View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>{stepContent}</ScrollView>
      )}
    </View>
  );
}
