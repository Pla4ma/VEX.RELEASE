import React from 'react';
import { View } from 'react-native';

import { StatusBanner } from '../../../shared/ui/components/StatusFeedback';
import type { HomeCard } from '../../../features/home-spine/schemas';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import { ProgressPreviewCard, ReturnReasonCard } from '../HomeProgressiveBlocks';
import { GradientStartButton } from '../HomeScreenVisuals';

interface HomePrimaryRailProps {
  isOnline: boolean;
  loadError: Error | null;
  onDismissHighlight: () => void;
  onRetry: () => Promise<unknown>;
  onStart: () => void;
  onOpenProgress: () => void;
  primaryAction: HomeCard;
  progressSignal: HomeCard;
  returnReason: HomeReturnReason;
}

export function HomePrimaryRail({
  isOnline,
  loadError,
  onDismissHighlight,
  onRetry,
  onStart,
  onOpenProgress,
  primaryAction,
  progressSignal,
  returnReason,
}: HomePrimaryRailProps): JSX.Element {
  return (
    <View style={{ gap: 16 }}>
      {!isOnline ? (
        <StatusBanner
          status="offline"
          message="Offline mode is on"
          description="You can still start a session. VEX will sync your momentum when you reconnect."
        />
      ) : null}
      <GradientStartButton
        body={primaryAction.body}
        buttonLabel={primaryAction.ctaLabel}
        eyebrow={primaryAction.eyebrow}
        onPress={onStart}
        pulse={returnReason.source === 'completion-highlight' || returnReason.source === 'coach'}
        title={primaryAction.title}
      />
      <ProgressPreviewCard
        body={progressSignal.body}
        ctaLabel={progressSignal.ctaLabel}
        eyebrow={progressSignal.eyebrow}
        onPress={onOpenProgress}
        title={progressSignal.title}
      />
      <ReturnReasonCard
        body={returnReason.body}
        ctaLabel={returnReason.ctaLabel}
        eyebrow={returnReason.eyebrow}
        onDismiss={returnReason.source === 'completion-highlight' ? onDismissHighlight : undefined}
        onPress={() => void returnReason.onPress()}
        tone={returnReason.tone}
        title={returnReason.title}
      />
      {loadError ? (
        <StatusBanner
          status="error"
          message="Some sections are still syncing"
          description="Your progress is safe. Retrying will refresh the missing data."
          onRetry={() => void onRetry()}
        />
      ) : null}
    </View>
  );
}
