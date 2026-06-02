import React from 'react';

import { EmptyState } from './empty-state';

export function NoMessagesEmptyState({
  onBrowseChallenges,
}: {
  onBrowseChallenges?: () => void;
}) {
  return (
    <EmptyState
      iconName="bell"
      title="No Messages Yet"
      message="Your coach will send personalized messages here based on your activity and progress."
      actionLabel="Start a session"
      onAction={onBrowseChallenges}
      secondaryActionLabel="Browse Challenges"
      onSecondaryAction={onBrowseChallenges}
    />
  );
}

export function NoHistoryEmptyState() {
  return (
    <EmptyState
      iconName="file"
      title="No Message History"
      message="Complete sessions and build streaks to see your coaching history here."
      actionLabel="Start First Session"
    />
  );
}

export function NoRecommendationsEmptyState({
  onViewChallenges,
}: {
  onViewChallenges?: () => void;
}) {
  return (
    <EmptyState
      iconName="target"
      title="No Recommendations"
      message="We're learning your patterns. Check back soon for personalized session suggestions!"
      actionLabel="View Challenges"
      onAction={onViewChallenges}
    />
  );
}

export function NoComebackEmptyState() {
  return (
    <EmptyState
      iconName="bolt"
      title="No Active Comeback"
      message="Your streak is healthy! Comeback mode activates if you break a streak of 3+ days."
    />
  );
}

export function MutedStateEmptyState({ onUnmute }: { onUnmute?: () => void }) {
  return (
    <EmptyState
      iconName="bell"
      title="Notifications Muted"
      message="You've muted coach notifications. You can still see messages in the app."
      actionLabel="Unmute Notifications"
      onAction={onUnmute}
    />
  );
}

export function ErrorStateEmptyState({
  error,
  onRetry,
}: {
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      iconName="exclamation-triangle"
      title="Something Went Wrong"
      message={error || "We couldn't load your coach data. Please try again."}
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}

export function OfflineEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      iconName="exclamation-circle"
      title="You're Offline"
      message="Coach messages will sync when you reconnect. Some features may be limited."
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function NoPersonasEmptyState() {
  return (
    <EmptyState
      iconName="users"
      title="No Coach Personas"
      message="Loading coach personas..."
    />
  );
}

export function ColdStartEmptyState({ onStart }: { onStart?: () => void }) {
  return (
    <EmptyState
      iconName="plus-circle"
      title="Welcome to Your Coach"
      message="Your AI coach learns from your sessions. Complete a few to get personalized guidance!"
      actionLabel="Start First Session"
      onAction={onStart}
    />
  );
}
