import React from 'react';
import { EmptyState } from './EmptyState.base';

export function EmptyAnalytics({
  onStartSession,
}: {
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      iconName="chart"
      tone="primary"
      title="No Data Yet"
      message="We can't analyze what hasn't happened. One session changes everything — your patterns, your insights, your trajectory."
      actionLabel="Start First Session"
      onAction={onStartSession}
    />
  );
}

export function EmptyInsights({
  onViewSessions,
}: {
  onViewSessions?: () => void;
}) {
  return (
    <EmptyState
      iconName="bolt"
      tone="info"
      title="Pattern Analysis Pending"
      message="We need more focus sessions to understand your rhythm. The AI Coach learns from consistency — give it something to work with."
      actionLabel="View Sessions"
      onAction={onViewSessions}
    />
  );
}

export function EmptyChallenges({
  onBrowseChallenges,
}: {
  onBrowseChallenges?: () => void;
}) {
  return (
    <EmptyState
      iconName="trophy"
      tone="warning"
      title="No Active Challenges"
      message="Challenges are where legends are made. Pick a mission, rally your squad, and prove what you're capable of."
      actionLabel="Find a Challenge"
      onAction={onBrowseChallenges}
    />
  );
}

export function EmptyNotifications({
  onAdjustSettings,
}: {
  onAdjustSettings?: () => void;
}) {
  return (
    <EmptyState
      iconName="bell"
      tone="primary"
      title="Quiet... Too Quiet"
      message="Nothing to see yet — but your streak breaking would change that real fast."
      secondaryActionLabel="Notification Settings"
      onSecondaryAction={onAdjustSettings}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      iconName="compass"
      tone="error"
      title="VEX Lost Connection"
      message="Your progress is safe locally. Check your connection and we'll sync when you're back online."
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function EmptyFeed({
  _bossName,
  onStartSession,
}: {
  bossName: string;
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      iconName="users"
      tone="primary"
      title="No sessions yet"
      message="Your squad doesn't have any sessions to show yet. Start one to lead the way."
      actionLabel="Start a session"
      onAction={onStartSession}
    />
  );
}

export function EmptyRivals({ onFindRivals }: { onFindRivals?: () => void }) {
  return (
    <EmptyState
      iconName="target"
      tone="warning"
      title="No Rivals Yet"
      message="Ghost rivals are warming your seat. They're already focused. Find real competitors and take them on."
      actionLabel="Find Rivals"
      onAction={onFindRivals}
    />
  );
}

export function EmptyAchievements({
  onStartSession,
}: {
  onStartSession?: () => void;
}) {
  return (
    <EmptyState
      iconName="trophy"
      tone="warning"
      title="Zero Achievements"
      message="Zero. One session changes that permanently. Every legend starts with a single focus block."
      actionLabel="Start Session"
      onAction={onStartSession}
    />
  );
}
