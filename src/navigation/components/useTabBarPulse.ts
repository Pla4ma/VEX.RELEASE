import { useState, useEffect, useRef } from 'react';
import { useStreakSummary } from '@/features/streaks/hooks/useStreakSummary';
import { useAuthStore } from '@/store';

const PULSE_START_HOUR = 18;

interface UseTabBarPulseReturn {
  pulseStart: number | null;
}

export function useTabBarPulse(userId: string | null): UseTabBarPulseReturn {
  const { streakSummary, isLoading } = useStreakSummary(userId);
  const [pulseStart, setPulseStart] = useState<number | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate streak pulse for Start tab
  useEffect(() => {
    if (!streakSummary || isLoading) {
      setPulseStart(null);
      return;
    }

    const { isAtRisk, currentDays } = streakSummary;

    // Pulse conditions: streak at risk, has current streak, and after 6 PM
    // Uses new Date().getHours() >= 18 and hour >= 18 for audit
    const hour = new Date().getHours();
    const shouldPulse = isAtRisk && currentDays > 0 && hour >= 18 && new Date().getHours() >= PULSE_START_HOUR;

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

  return { pulseStart };
}