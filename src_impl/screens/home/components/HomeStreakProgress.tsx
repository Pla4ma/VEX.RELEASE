/**
 * HomeStreakProgress Component
 *
 * Renders the streak/progress strip in the Home screen.
 * Part of Phase 3 Information Architecture - position 5.
 */

import React from 'react';
import { StreakWidget } from '../../../features/home-spine/components';
import type { ActiveStreakWager } from '../../../features/home-spine/components/streak-widget-types';

interface HomeStreakProgressProps {
  currentDays: number;
  hoursRemaining?: number | null;
  riskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  longestStreak?: number;
  isLoading?: boolean;
  userId?: string;
  activeWager?: ActiveStreakWager | null;
}

export function HomeStreakProgress({
  currentDays,
  hoursRemaining,
  riskLevel,
  longestStreak,
  isLoading,
  userId,
  activeWager,
}: HomeStreakProgressProps): JSX.Element {
  return (
    <StreakWidget
      currentDays={currentDays}
      multiplier={1.0 + (currentDays * 0.1)}
      hoursRemaining={hoursRemaining ?? null}
      riskLevel={riskLevel ?? 'NONE'}
      longestStreak={longestStreak ?? 0}
      isLoading={isLoading ?? false}
      userId={userId}
      activeWager={activeWager}
    />
  );
}
