import { useState, useEffect, useRef } from 'react';
import type { StreakSummary } from '../../features/streaks/schemas';

const PULSE_START_HOUR = 18;

export function useStreakPulse(
  streakSummary: StreakSummary | null | undefined,
  isLoading: boolean,
) {
  const [pulseStart, setPulseStart] = useState<number | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseStartedRef = useRef(false);

  useEffect(() => {
    if (!streakSummary || isLoading) {
      setPulseStart(null);
      pulseStartedRef.current = false;
      return;
    }

    const { isAtRisk, currentDays } = streakSummary;
    const hour = new Date().getHours();
    const shouldPulse = isAtRisk && currentDays > 0 && hour >= PULSE_START_HOUR;

    if (shouldPulse) {
      if (!pulseStartedRef.current) {
        setPulseStart(Date.now());
        pulseStartedRef.current = true;
      }
    } else {
      setPulseStart(null);
      pulseStartedRef.current = false;
    }

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [streakSummary, isLoading, pulseTimeoutRef, pulseStartedRef]);

  return pulseStart;
}