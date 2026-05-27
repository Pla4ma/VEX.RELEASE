import React from "react";
import { View } from "react-native";

import { StatusBanner } from "../../../shared/ui/components/StatusFeedback";
import { FocusScoreHomeWidget } from "../../../features/focus-identity/components/focus-score-home-widget";
import { useFocusScoreDashboardModel } from "../../../features/focus-identity/hooks-focus-score";
import type { HomeCard } from "../../../features/home-spine/schemas";
import type { CompletionSyncState } from "../../../store/session-state";
import { useAuthStore } from "../../../store";
import type { HomeReturnReason } from "../hooks/useHomeReturnReason";
import {
  ProgressPreviewCard,
  ReturnReasonCard,
} from "../HomeProgressiveBlocks";
import { GradientStartButton } from "../HomeScreenVisuals";

interface HomePrimaryRailProps {
  completionSync: CompletionSyncState;
  isOnline: boolean;
  loadError: Error | null;
  onDismissHighlight: () => void;
  onRepairSync: () => Promise<unknown>;
  onRetry: () => Promise<unknown>;
  onStart: () => void;
  onOpenProgress: () => void;
  primaryAction: HomeCard;
  progressSignal: HomeCard;
  returnReason: HomeReturnReason;
}

export function HomePrimaryRail({
  completionSync,
  isOnline,
  loadError,
  onDismissHighlight,
  onRepairSync,
  onRetry,
  onStart,
  onOpenProgress,
  primaryAction,
  progressSignal,
  returnReason,
}: HomePrimaryRailProps): JSX.Element {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const focusModel = useFocusScoreDashboardModel(userId, 30);

  return (
    <View style={{ gap: 16 }}>
      {!isOnline ? (
        <StatusBanner
          status="offline"
          message="Offline mode is on"
          description="You can still start a session. VEX will sync your momentum when you reconnect."
        />
      ) : null}
      {completionSync.status === "pending_sync" && completionSync.message ? (
        <StatusBanner
          status="offline"
          message="Session sync pending"
          description={completionSync.message}
        />
      ) : null}
      {completionSync.status === "failed_sync" && completionSync.message ? (
        <StatusBanner
          status="error"
          message="Session rewards need repair"
          description={completionSync.message}
          onRetry={() => void onRepairSync()}
        />
      ) : null}
      <GradientStartButton
        body={primaryAction.body}
        buttonLabel={primaryAction.ctaLabel}
        eyebrow={primaryAction.eyebrow}
        onPress={onStart}
        pulse={
          returnReason.source === "completion-highlight" ||
          returnReason.source === "coach"
        }
        title={primaryAction.title}
      />
      <FocusScoreHomeWidget
        model={focusModel}
        onPress={onOpenProgress}
        onRetry={() => {
          void focusModel.refetch();
        }}
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
        onDismiss={
          returnReason.source === "completion-highlight"
            ? onDismissHighlight
            : undefined
        }
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
