import { useCallback, useEffect, useRef, useState } from 'react';

import { useActiveBoss } from '../../../features/boss/hooks';
import { useActiveStudyPlan } from '../../../features/content-study/hooks/useActiveStudyPlan';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useStreakSummary } from '../../../features/streaks/hooks';
import { useSessionStats } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { debug } from '../../../utils/debug';
import { RECOMMENDATION_RULES } from './home-recommendation-rules';
import type {
  HomeRecommendation,
  RecommendationContext,
  UrgencyLevel,
} from './home-recommendation-types';

export type { HomeRecommendation, RecommendationContext, UrgencyLevel };

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Home recommendation rule failed');
}

export class HomeRecommendationEngine {
  constructor(private readonly context: RecommendationContext) {}

  getRecommendation(): HomeRecommendation {
    const startTime = performance.now();
    for (const rule of RECOMMENDATION_RULES) {
      try {
        if (rule.condition(this.context)) {
          const recommendation = rule.generate(this.context);
          debug.info(`[HomeRecommendationEngine] Selected: ${rule.name}`, {
            duration: Math.round(performance.now() - startTime),
            priority: recommendation.priority,
            type: recommendation.type,
            urgency: recommendation.urgency,
          });
          return recommendation;
        }
      } catch (error) {
        debug.error(`[HomeRecommendationEngine] Rule ${rule.name} failed`, toError(error));
      }
    }
    const fallbackRule = RECOMMENDATION_RULES[RECOMMENDATION_RULES.length - 1]!;
    return fallbackRule.generate(this.context);
  }

  getAllApplicable(): HomeRecommendation[] {
    return RECOMMENDATION_RULES
      .filter((rule) => rule.condition(this.context))
      .map((rule) => rule.generate(this.context));
  }

  shouldRefresh(lastRefreshTime: number, currentRec: HomeRecommendation): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceRefresh = Date.now() - lastRefreshTime;
    return timeSinceRefresh > fiveMinutes || Boolean(currentRec.expiresAt && Date.now() > currentRec.expiresAt);
  }
}

export function useHomeRecommendation(): {
  recommendation: HomeRecommendation | null;
  isLoading: boolean;
  refresh: () => void;
} {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { data: activeStudyPlan, isLoading: studyLoading } = useActiveStudyPlan();
  const { data: streak, isLoading: streakLoading } = useStreakSummary(userId);
  const { data: progression, isLoading: progLoading } = useProgressionSummary(userId);
  const { data: activeBoss, isLoading: bossLoading } = useActiveBoss(userId);
  const { stats, isLoading: statsLoading } = useSessionStats(userId);
  const [recommendation, setRecommendation] = useState<HomeRecommendation | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const lastRecRef = useRef<HomeRecommendation | null>(null);

  const generateRecommendation = useCallback((): void => {
    if (!userId) {
      return;
    }
    const context: RecommendationContext = {
      activeBoss: activeBoss ?? null,
      activeStudyPlan: activeStudyPlan ?? null,
      currentLevel: progression?.level ?? 1,
      currentTime: new Date(),
      hasCompletedSessionToday: stats?.completedSessions ? stats.completedSessions > 0 : false,
      lastSessionTimestamp: undefined,
      progression: progression ?? null,
      streak: streak ?? null,
      totalSessions: stats?.totalSessions ?? 0,
      userId,
    };
    const engine = new HomeRecommendationEngine(context);
    if (lastRecRef.current && !engine.shouldRefresh(lastRefreshRef.current, lastRecRef.current)) {
      return;
    }
    const newRec = engine.getRecommendation();
    lastRecRef.current = newRec;
    lastRefreshRef.current = Date.now();
    setRecommendation(newRec);
  }, [activeBoss, activeStudyPlan, progression, stats, streak, userId]);

  useEffect(() => {
    generateRecommendation();
  }, [generateRecommendation]);

  const refresh = useCallback((): void => {
    lastRefreshRef.current = 0;
    generateRecommendation();
  }, [generateRecommendation]);

  return {
    isLoading: studyLoading || streakLoading || progLoading || bossLoading || statsLoading,
    recommendation,
    refresh,
  };
}
