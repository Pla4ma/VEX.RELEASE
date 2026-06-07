import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useOnboardingProgressState } from '../hooks';
import { OnboardingNavigator } from './OnboardingNavigator';
import type { FocusGoal } from '../schemas';
import { withScreenErrorBoundary } from '../../../shared/ui/components/ScreenErrorBoundary';
import { captureSilentFailure } from '../../../utils/silent-failure';
interface OnboardingFlowProps {
  onStartSession: (config: {
    duration: number;
    category: FocusGoal | null;
  }) => void;
  onBack?: () => void;
  onComplete?: () => void;
}
function NotificationPermissionScreen({
  onComplete,
}: {
  onComplete: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const [NotificationCard, setNotificationCard] = React.useState<React.FC<{
    userId: string;
  }> | null>(null);
  React.useEffect(() => {
    import('../../../screens/onboarding/components/OnboardingNotificationPermissionCard')
      .then((mod) => {
        setNotificationCard(() => mod.OnboardingNotificationPermissionCard);
      })
      .catch((error: unknown) => {
        captureSilentFailure(error, { feature: 'onboarding', operation: 'loadNotificationCard', type: 'data' });
        onComplete();
      });
  }, [onComplete]);
  if (!NotificationCard) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton width={40} height={40} variant="circular" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Stay on Track
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        Enable notifications to protect your streak and get reminded when it
        matters.
      </Text>
      {}
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.text.tertiary,
          marginTop: 16,
        }}
      >
        Notification permission screen placeholder
      </Text>
    </View>
  );
}
function FirstResultScreen({
  onComplete,
}: {
  onComplete: () => void;
}): JSX.Element {
  const [FirstResult, setFirstResult] = React.useState<React.FC<{
    userName: string;
    sessionDuration: number;
    sessionData: {
      completedDurationSeconds: number;
      targetDurationSeconds: number;
      effectiveFocusedSeconds: number;
      pauseCount: number;
      interruptionCount: number;
      backgroundTimeSeconds: number;
      mode: string;
      strictMode: boolean;
      isAbandoned: boolean;
    };
    focusScoreBefore: number;
    onComplete: () => void;
  }> | null>(null);
  React.useEffect(() => {
    import('./FirstResultScreen')
      .then((mod) => {
        setFirstResult(
          () =>
            mod.FirstResultScreen as React.FC<{
              userName: string;
              sessionDuration: number;
              sessionData: {
                completedDurationSeconds: number;
                targetDurationSeconds: number;
                effectiveFocusedSeconds: number;
                pauseCount: number;
                interruptionCount: number;
                backgroundTimeSeconds: number;
                mode: string;
                strictMode: boolean;
                isAbandoned: boolean;
              };
              focusScoreBefore: number;
              onComplete: () => void;
            }>,
        );
      })
      .catch((error: unknown) => {
        captureSilentFailure(error, { feature: 'onboarding', operation: 'loadFirstResultScreen', type: 'data' });
        onComplete();
      });
  }, [onComplete]);
  if (!FirstResult) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton width={40} height={40} variant="circular" />
      </View>
    );
  }
  return (
    <FirstResult
      userName="User"
      sessionDuration={10}
      sessionData={{
        completedDurationSeconds: 600,
        targetDurationSeconds: 600,
        effectiveFocusedSeconds: 580,
        pauseCount: 0,
        interruptionCount: 0,
        backgroundTimeSeconds: 20,
        mode: 'STARTER',
        strictMode: false,
        isAbandoned: false,
      }}
      focusScoreBefore={550}
      onComplete={onComplete}
    />
  );
}
export const OnboardingFlow = withScreenErrorBoundary(function _OnboardingFlow({
  onStartSession,
  onBack,
  onComplete: _onComplete,
}: OnboardingFlowProps): JSX.Element {
  const { state, isLoading } =
    useOnboardingProgressState();
  if (isLoading || !state) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton width={40} height={40} variant="circular" />
      </View>
    );
  }
  // OnboardingState (Zustand) does not yet expose steps/permissions fields.
  // OnboardingProgress (TanStack Query) will provide these once the
  // architecture alignment between Zustand ↔ Supabase progress completes.
  // Until then, the NotificationPermissionScreen and FirstResultScreen
  // helpers are defined above but unreachable.
  return (
    <OnboardingNavigator
      onStartSession={(config) => {
        onStartSession(config);
      }}
      onBack={onBack}
    />
  );
}, 'Onboarding');
export default OnboardingFlow;
