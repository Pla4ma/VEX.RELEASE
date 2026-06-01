import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useActiveStudyPlan } from '../../content-study/hooks/useActiveStudyPlan';
import { useStreakSummary } from '../../streaks/hooks';
import { useProgressionSummary } from '../../progression/hooks';
import { useActiveBoss } from '../../boss/hooks';
import { useSessionStats } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { buildBehaviorProfile } from '../session-analyzer';
import { getOrCreateCoachState } from '../persona-manager';
import {
  CoachRecommendationService,
  type CoachRecommendation,
  type RecommendationContext,
  convertToHomeRecommendation,
} from '../services/CoachRecommendationService';
function getLastSessionAt(stats: unknown): number {
  if (stats && typeof stats === 'object' && 'lastSessionAt' in stats) {
    const value = Reflect.get(stats, 'lastSessionAt');
    if (typeof value === 'number') {
      return value;
    }
  }
  return Date.now() - 7 * 24 * 60 * 60 * 1000;
}
export interface UseCoachRecommendationReturn {
  recommendation: CoachRecommendation | null;
  isLoading: boolean;
  refresh: () => void;
  getPersonaName: () => string;
}
export function useCoachRecommendation(): UseCoachRecommendationReturn {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { data: activeStudyPlan, isLoading: studyLoading } =
    useActiveStudyPlan();
  const { data: streak, isLoading: streakLoading } = useStreakSummary(userId);
  const { data: progression, isLoading: progLoading } =
    useProgressionSummary(userId);
  const { data: activeBoss, isLoading: bossLoading } = useActiveBoss(userId);
  const { stats, isLoading: statsLoading } = useSessionStats(userId);
  const [coachPersonaId, setCoachPersonaId] = useState<string>('mentor');
  const [behaviorProfile, setBehaviorProfile] =
    useState<RecommendationContext['behaviorProfile']>(null);
  const [recommendation, setRecommendation] =
    useState<CoachRecommendation | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const lastRecRef = useRef<CoachRecommendation | null>(null);
  useEffect(() => {
    if (!userId) {
      return;
    }
    async function fetchCoachState(): Promise<void> {
      try {
        const state = await getOrCreateCoachState(userId);
        setCoachPersonaId(state.personaId || 'mentor');
        const profile = await buildBehaviorProfile(userId);
        setBehaviorProfile(profile);
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            feature: 'ai-coach',
            operation: 'fetch-coach-recommendation-state',
          },
        });
      }
    }
    fetchCoachState();
  }, [userId]);
  const generateRecommendation = useCallback(() => {
    if (!userId) {
      return;
    }
    const lastSessionAt = getLastSessionAt(stats);
    const daysSinceLastSession =
      (Date.now() - lastSessionAt) / (1000 * 60 * 60 * 24);
    let studyPlanProgress = 0;
    let studyPlanDaysBehind = 0;
    if (activeStudyPlan && activeStudyPlan.totalTasks > 0) {
      studyPlanProgress =
        activeStudyPlan.completedTasks / activeStudyPlan.totalTasks;
      const expectedProgress = Math.max(1, activeStudyPlan.totalTasks / 7);
      const daysElapsed = Math.max(1, Math.floor(daysSinceLastSession) || 1);
      const expectedTasks = expectedProgress * daysElapsed;
      studyPlanDaysBehind = Math.max(
        0,
        Math.floor(expectedTasks - activeStudyPlan.completedTasks),
      );
    }
    let hoursUntilStreakBreak: number | null = null;
    if (streak && streak.currentDays > 0 && !stats?.completedSessions) {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      hoursUntilStreakBreak = Math.max(
        0,
        (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60),
      );
    }
    const context: RecommendationContext = {
      userId,
      currentTime: new Date(),
      streakDays: streak?.currentDays ?? 0,
      hasCompletedSessionToday: stats?.completedSessions
        ? stats.completedSessions > 0
        : false,
      hoursUntilStreakBreak,
      activeStudyPlan: activeStudyPlan ?? null,
      studyPlanProgress,
      studyPlanDaysBehind,
      activeBoss: activeBoss
        ? {
            id: activeBoss.bossId,
            name: activeBoss.bossName,
            healthRemaining: activeBoss.healthRemaining,
            maxHealth: activeBoss.maxHealth,
            timeRemaining: activeBoss.timeRemaining ?? 24,
          }
        : null,
      totalSessions: stats?.totalSessions ?? 0,
      currentLevel: progression?.level ?? 1,
      lastSessionTimestamp: lastSessionAt,
      daysSinceLastSession,
      behaviorProfile,
      coachPersonaId,
    };
    const service = new CoachRecommendationService(context);
    if (
      lastRecRef.current &&
      !service.shouldRefresh(lastRefreshRef.current, lastRecRef.current)
    ) {
      return;
    }
    const newRec = service.getRecommendation();
    lastRecRef.current = newRec;
    lastRefreshRef.current = Date.now();
    setRecommendation(newRec);
  }, [
    userId,
    activeStudyPlan,
    streak,
    progression,
    activeBoss,
    stats,
    behaviorProfile,
    coachPersonaId,
  ]);
  useEffect(() => {
    generateRecommendation();
  }, [generateRecommendation]);
  const refresh = useCallback(() => {
    lastRefreshRef.current = 0;
    generateRecommendation();
  }, [generateRecommendation]);
  const getPersonaName = useCallback(() => {
    const names: Record<string, string> = {
      mentor: 'Mentor',
      trainer: 'Trainer',
      peer: 'Peer',
      professor: 'Professor',
    };
    return names[coachPersonaId] || 'Mentor';
  }, [coachPersonaId]);
  const isLoading =
    studyLoading || streakLoading || progLoading || bossLoading || statsLoading;
  return { recommendation, isLoading, refresh, getPersonaName };
}
export function useCoachHomeRecommendation() {
  const { recommendation, isLoading, refresh, getPersonaName } =
    useCoachRecommendation();
  const homeRecommendation = useMemo(() => {
    if (!recommendation) {
      return null;
    }
    return convertToHomeRecommendation(recommendation);
  }, [recommendation]);
  return {
    recommendation: homeRecommendation,
    isLoading,
    refresh,
    getPersonaName,
  };
}
export default useCoachRecommendation;
