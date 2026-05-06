/**
 * OnboardingFlow Component (Phase 3)
 *
 * Main onboarding container that enforces first session completion
n * and delays notification permission until after value moment.
 *
 * @phase 3
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useOnboardingProgressState } from '../hooks';
import { OnboardingNavigator } from './OnboardingNavigator';
import type { FocusGoal } from '../schemas';

interface OnboardingFlowProps {
  /** Navigate to active session */
  onStartSession: (config: { duration: number; category: FocusGoal | null }) => void;
  /** Navigate back to auth/previous screen */
  onBack?: () => void;
  /** Called when onboarding is fully complete */
  onComplete?: () => void;
}

/**
 * Notification Permission Screen (placeholder)
 * Full implementation uses OnboardingNotificationPermissionCard
 */
function NotificationPermissionScreen({
  onComplete,
}: {
  onComplete: () => void;
}): JSX.Element {
  // Lazy load the actual notification component to avoid circular deps
  const [NotificationCard, setNotificationCard] = React.useState<React.FC<{
    userId: string;
  }> | null>(null);

  React.useEffect(() => {
    import('../../../screens/onboarding/components/OnboardingNotificationPermissionCard')
      .then((mod) => {
        setNotificationCard(() => mod.OnboardingNotificationPermissionCard);
      })
      .catch(() => {
        // Fallback if component not available
        onComplete();
      });
  }, [onComplete]);

  if (!NotificationCard) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Stay on Track
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        Enable notifications to protect your streak and get reminded when it matters.
      </Text>
      {/* NotificationCard would be rendered here with userId */}
      <Text style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
        Notification permission screen placeholder
      </Text>
    </View>
  );
}

/**
 * First Reward Screen (placeholder)
 */
function FirstRewardScreen({
  onComplete,
}: {
  onComplete: () => void;
}): JSX.Element {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        First Session Complete!
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
        You have taken the first step. Your focus journey begins now.
      </Text>
      <Text onPress={onComplete} style={{ fontSize: 16, color: '#007AFF' }}>
        Continue
      </Text>
    </View>
  );
}

/**
 * OnboardingFlow with first session gate
 *
 * Phase 3 rules:
 * 1. Don't ask for notifications until AFTER first session
 * 2. Show reward screen after first session completion
 * 3. Cannot complete onboarding without first session
 */
export function OnboardingFlow({
  onStartSession,
  onBack,
  onComplete,
}: OnboardingFlowProps): JSX.Element {
  const { state, isLoading, markNotificationAsked, markRewardSeen } =
    useOnboardingProgressState();

  if (isLoading || !state) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Phase 3: Don't ask for notifications until AFTER first session
  if (state.steps.firstSessionCompleted && !state.permissions.notificationAsked) {
    return (
      <NotificationPermissionScreen
        onComplete={() => {
          markNotificationAsked(true);
        }}
      />
    );
  }

  // Show reward screen after first session but before full completion
  if (state.steps.firstSessionCompleted && !state.steps.rewardSeen) {
    return (
      <FirstRewardScreen
        onComplete={() => {
          markRewardSeen();
          onComplete?.();
        }}
      />
    );
  }

  // Normal onboarding flow
  return (
    <OnboardingNavigator
      onStartSession={(config) => {
        // Mark first session as started in progress state
        // Session ID will be updated when session actually starts
        onStartSession(config);
      }}
      onBack={onBack}
    />
  );
}

export default OnboardingFlow;
