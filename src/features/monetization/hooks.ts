import { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import type { SessionSummary } from '../../session/types';
import { useAuthStore } from '../../store';
import { usePremiumStatus } from '../../shared/monetization';
import {
  getStreakShieldRecord,
  saveStreakShieldRecord,
} from './repository';
import {
  buildStreakShieldMoment,
  createStreakShieldRecord,
} from './service';
import type { StreakShieldMoment } from './types';

type HookInput = {
  sessionId: string;
  summary: SessionSummary;
};

export function useStreakShieldMoment({
  sessionId,
  summary,
}: HookInput): {
  markShown: () => Promise<void>;
  moment: StreakShieldMoment | null;
} {
  const { user } = useAuthStore();
  const { isPremium } = usePremiumStatus();
  const [paywallShownThisSession, setPaywallShownThisSession] = useState(false);
  const [moment, setMoment] = useState<StreakShieldMoment | null>(null);
  const userId = user?.id ?? '';

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      if (!userId) {
        setMoment(null);
        return;
      }
      try {
        const record = await getStreakShieldRecord(userId);
        const result = await buildStreakShieldMoment({
          finalScore: summary.finalScore ?? 0,
          isPremium,
          now: Date.now(),
          paywallShownThisSession,
          record,
          sessionId,
          streakDays: summary.streakDays ?? 0,
          userId,
        });
        if (active) {
          setMoment(result.shouldShow ? { copy: result.copy, routeParams: result.routeParams } : null);
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'monetization', operation: 'streak-shield-moment' },
        });
        if (active) {
          setMoment(null);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isPremium, paywallShownThisSession, sessionId, summary.finalScore, summary.streakDays, userId]);

  const markShown = useCallback(async (): Promise<void> => {
    if (!userId) {
      return;
    }
    setPaywallShownThisSession(true);
    await saveStreakShieldRecord(userId, createStreakShieldRecord(sessionId, Date.now()));
  }, [sessionId, userId]);

  return { markShown, moment };
}
