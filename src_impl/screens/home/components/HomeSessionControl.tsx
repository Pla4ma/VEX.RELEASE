/**
 * HomeSessionControl Component
 *
 * Renders the primary session start control in the Home screen.
 * Part of Phase 3 Information Architecture - position 3.
 */

import React from 'react';
import { StartSessionButton } from '../../../features/home-spine/components';

interface HomeSessionControlProps {
  hasActiveSession: boolean;
  isLoading: boolean;
  onPress: () => void;
  resumeTimeSeconds?: number;
  squadMembersFocusing?: number;
  streakHoursRemaining?: number | null;
  streakRiskLevel?: string;
}

export function HomeSessionControl({
  hasActiveSession,
  isLoading,
  onPress,
  resumeTimeSeconds,
  squadMembersFocusing,
  streakHoursRemaining,
  streakRiskLevel,
}: HomeSessionControlProps): JSX.Element {
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