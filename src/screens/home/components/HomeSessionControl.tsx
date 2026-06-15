/**
 * HomeSessionControl Component
 *
 * Renders the primary session start control in the Home screen.
 * Part of Phase 3 Information Architecture - position 3.
 */

import React from 'react';
import { StartSessionButton } from '../../../features/home-spine/components/StartSessionButton';
import { SessionRecommendationCard } from '../../../features/session-recommendation/components/SessionRecommendationCard';
import type { SessionRecommendation } from '../../../features/session-recommendation/types';

interface HomeSessionControlProps {
  hasActiveSession: boolean;
  isLoading: boolean;
  onPress: () => void;
  resumeTimeSeconds?: number;
  squadMembersFocusing?: number;
  streakHoursRemaining?: number | null;
  streakRiskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation?: SessionRecommendation | null;
}

export function HomeSessionControl({
  hasActiveSession,
  isLoading,
  onPress,
  resumeTimeSeconds,
  squadMembersFocusing,
  streakHoursRemaining,
  streakRiskLevel,
  recommendation,
}: HomeSessionControlProps): React.ReactNode {
  if (recommendation && !recommendation.isBlocked) {
    return (
      <SessionRecommendationCard
        recommendation={recommendation}
        onAccept={onPress}
        onDismiss={() => {
          // Recommendation dismissed - analytics handled by SessionRecommendationCard
        }}
      />
    );
  }

  return (
    <StartSessionButton
      hasActiveSession={hasActiveSession}
      isLoading={isLoading}
      onPress={onPress}
      resumeTimeSeconds={resumeTimeSeconds}
      squadMembersFocusing={squadMembersFocusing}
      streakHoursRemaining={streakHoursRemaining}
      streakRiskLevel={streakRiskLevel ?? 'NONE'}
    />
  );
}
