import { useState, useEffect, useRef } from 'react';
import type { StreakSummary } from '../../features/streaks/schemas';

const PULSE_START_HOUR = 18;

export function useStreakPulse(
  streakSummary: StreakSummary | null | undefined,
  isLoading: boolean,
) {
  const [pulseStart, setPulseStart] = useState<number | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!streakSummary || isLoading) {
      setPulseStart(null);
      return;
    }

    const { isAtRisk, currentDays } = streakSummary;
    const hour = new Date().getHours();
    const shouldPulse = isAtRisk && currentDays > 0 && hour >= PULSE_START_HOUR;

    if (shouldPulse) {
      if (pulseStart === null) {
        setPulseStart(Date.now());
      }
    } else {
      setPulseStart(null);
    }

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [streakSummary, isLoading, pulseStart]);

  return pulseStart;
}