import React from 'react';

import { useCompanionPromise } from '../../../features/companion-promise/hooks';
import {
  CoachPresenceCard,
  useCoachPresence,
} from $1../../../features/coach-presence/components/CoachPresenceCard$1;
import type { FeatureAccessMap } from $1../../../features/coach-presence/components/CoachPresenceCard$1;
import { HomeCompanionWidget } from './HomeCompanionWidget';
import { HomeSectionBoundary } from './HomeSectionBoundary';
import { useHomeCompanion } from '../hooks/useHomeCompanion';

interface HomeCompanionSectionProps {
  currentStreakDays: number;
  features: FeatureAccessMap;
  highFocusStreak: number;
  isOnline: boolean;
  onAction: () => void;
  onPress: () => void;
  onRetry: () => void;
  totalSessions: number;
  userId: string;
}

export function HomeCompanionSection({
  currentStreakDays,
  features,
  highFocusStreak,
  isOnline,
  onAction,
  onPress,
  onRetry,
  totalSessions,
  userId,
}: HomeCompanionSectionProps): JSX.Element | null {
  const companionStatus = useHomeCompanion(userId, isOnline);
  const companionPromise = useCompanionPromise();
  const coachPresence = useCoachPresence({
    companion:
      companionStatus.kind === 'success' ? companionStatus.state : null,
    currentStreakDays,
    features,
    highFocusStreak,
    isOnline,
    totalSessions,
    userId,
  });
  const showCompanionContext =
    companionPromise.data.kind !== 'pending' &&
    companionPromise.data.kind !== 'missed';

  if (!showCompanionContext) {
    return null;
  }

  if (companionStatus.kind === 'success' && coachPresence.data) {
    return (
      <HomeSectionBoundary sectionName="Coach Presence">
        <CoachPresenceCard
          presence={coachPresence.data}
          onAction={onAction}
          onPress={onPress}
        />
      </HomeSectionBoundary>
    );
  }

  return (
    <HomeSectionBoundary sectionName="Coach Presence">
      <HomeCompanionWidget
        status={companionStatus}
        onRetry={() => {
          onRetry();
          coachPresence.refetch();
        }}
        onPress={onPress}
      />
    </HomeSectionBoundary>
  );
}
