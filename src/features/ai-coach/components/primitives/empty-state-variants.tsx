import React from 'react';

import { EmptyState } from './empty-state';

export function NoMessagesEmptyState({
  onBrowseChallenges,
}: {
  onBrowseChallenges?: () => void;
}) {
  return (
    <EmptyState
      icon="✉️"
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
      icon="📜"
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
      icon="🎯"
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
      icon="💪"
      title="No Active Comeback"
      message="Your streak is healthy! Comeback mode activates if you break a streak of 3+ days."
    />
  );
}

export function MutedStateEmptyState({ onUnmute }: { onUnmute?: () => void }) {
  return (
    <EmptyState
      icon="🔕"
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
      icon="⚠️"
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
      icon="📡"
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
      icon="🎭"
      title="No Coach Personas"
      message="Loading coach personas..."
    />
  );
}

export function ColdStartEmptyState({ onStart }: { onStart?: () => void }) {
  return (
    <EmptyState
      icon="🌱"
      title="Welcome to Your Coach"
      message="Your AI coach learns from your sessions. Complete a few to get personalized guidance!"
      actionLabel="Start First Session"
      onAction={onStart}
    />
  );
}
