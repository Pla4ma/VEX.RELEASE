import React from 'react';
import { View } from 'react-native';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton';
import { StatusBanner } from '../../shared/ui/components/StatusFeedback';
import type { Theme } from '../../theme';
import { paywallStyles as styles } from './paywall-styles';

export type PaywallStatusMessage = {
  tone: 'info' | 'warning' | 'celebration';
  title: string;
  body: string;
};

type StatusMessageProps = {
  statusMessage: PaywallStatusMessage;
  onDismiss: () => void;
};

export function PaywallStatusMessageBanner({
  statusMessage,
  onDismiss,
}: StatusMessageProps): JSX.Element {
  return (
    <StatusBanner
      status={
        statusMessage.tone === 'celebration'
          ? 'success'
          : statusMessage.tone === 'warning'
            ? 'error'
            : 'loading'
      }
      message={statusMessage.title}
      description={statusMessage.body}
      onDismiss={onDismiss}
    />
  );
}

export function PaywallLoadingState(): JSX.Element {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <Skeleton width="60%" height={32} />
        <Skeleton width="80%" height={16} />
      </View>
      <SkeletonCard lines={2} height={120} />
      <SkeletonCard lines={2} height={120} />
      <View style={styles.skeletonFeatures}>
        <Skeleton width="90%" height={16} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="70%" height={16} />
      </View>
    </View>
  );
}

type PaywallErrorStateProps = {
  theme: Theme;
  onRestore: () => void;
  onRetry: () => void;
};

export function PaywallErrorState({
  theme,
  onRestore,
  onRetry,
}: PaywallErrorStateProps): JSX.Element {
  return (
    <View style={styles.errorContainer}>
      <StatusBanner
        status="error"
        message="Couldn't load offers - try again"
        description="Pricing is temporarily unavailable. Your progress is safe."
        onRetry={onRetry}
      />
      <View style={styles.supportSection}>
        <Text
          variant="bodySmall"
          color={theme.colors.text.tertiary}
          style={styles.supportText}
        >
          Having trouble? Try again or contact support
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={onRestore}
          accessibilityLabel="Restore purchases"
          accessibilityRole="button"
          accessibilityHint="Checks the app store for existing VEX Premium entitlements."
        >
          Restore purchases
        </Button>
      </View>
    </View>
  );
}

type PaywallUnavailableStateProps = {
  onRestore: () => void;
  onRetry: () => void;
};

export function PaywallUnavailableState({
  onRestore,
  onRetry,
}: PaywallUnavailableStateProps): JSX.Element {
  return (
    <View style={styles.errorContainer}>
      <StatusBanner
        status="error"
        message="Live plans are not available yet"
        description="Premium is not purchasable from this screen until RevenueCat offerings load. The free focus loop still works."
        onRetry={onRetry}
      />
      <Button
        variant="ghost"
        size="sm"
        onPress={onRestore}
        accessibilityLabel="Restore purchases"
        accessibilityRole="button"
        accessibilityHint="Checks the app store for existing VEX Premium entitlements."
      >
        Restore purchases
      </Button>
    </View>
  );
}
