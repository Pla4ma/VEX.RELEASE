import { useEffect, useMemo, useState } from 'react';
import { captureSilentFailure } from '../../utils/silent-failure';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakSummary } from '../../features/streaks/hooks';
import { useSessionStats } from '../../session/hooks/useSession';
import {
  getMasteryRankDisplay,
  type MasteryState,
} from '../../features/mastery/types';
import { MasteryService } from '../../features/mastery/service';
import { useTheme } from '../../theme';

export interface ProfileStatsItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface UseProfileDataResult {
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: ReturnType<typeof getMasteryRankDisplay>;
  progressionQuery: ReturnType<typeof useProgressionSummary>;
  streakQuery: ReturnType<typeof useStreakSummary>;
  statsQuery: ReturnType<typeof useSessionStats>;
  loading: boolean;
  hasStatsError: boolean;
  xpPercent: number;
  stats: ProfileStatsItem[];
  theme: ReturnType<typeof useTheme>['theme'];
}

function makeMastery(userId: string): MasteryState {
  return {
    userId,
    totalMasteryPoints: 0,
    rank: 'APPRENTICE',
    techniques: {
      durationMastery: 0, purityMastery: 0, consistencyMastery: 0,
      comebackMastery: 0, bossMastery: 0,
    },
    activeChallenges: [],
    unlockedFeatures: [],
    updatedAt: Date.now(),
  };
}

const hours = (ms: number): string =>
  `${Math.round((ms / 3600000) * 10) / 10}h`;

export function useProfileData(
  userId: string | null,
): UseProfileDataResult {
  const { theme } = useTheme();
  const [mastery, setMastery] = useState<MasteryState>(makeMastery(userId ?? 'guest'));
  const [masteryLoading, setMasteryLoading] = useState(true);
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakSummary(userId);
  const statsQuery = useSessionStats(userId ?? '');
  const rankDisplay = getMasteryRankDisplay(mastery.rank);
  const xpPercent = Math.max(0, Math.min(100, progressionQuery.data?.progressPercent ?? 0));
  const loading = progressionQuery.isLoading || streakQuery.isLoading ||
    statsQuery.isLoading;
  const hasStatsError = !!(progressionQuery.error || streakQuery.error);

  const stats = useMemo<ProfileStatsItem[]>(() => [
    { label: 'Current Streak', value: `${streakQuery.data?.currentDays ?? 0} days`, icon: 'fire', color: theme.colors.warning.DEFAULT },
    { label: 'Longest Streak', value: `${streakQuery.data?.longestDays ?? 0} days`, icon: 'calendar', color: theme.colors.error.DEFAULT },
    { label: 'Level', value: `${progressionQuery.data?.level ?? 1}`, icon: 'star', color: theme.colors.primary[500] },
    { label: 'Total Sessions', value: `${statsQuery.stats?.totalSessions ?? 0}`, icon: 'activity', color: theme.colors.info.DEFAULT },
    { label: 'Focus Hours', value: hours(statsQuery.stats?.totalFocusTime ?? 0), icon: 'clock', color: theme.colors.success.DEFAULT },
    { label: 'Avg. Session', value: hours(statsQuery.stats?.averageSessionDuration ?? 0), icon: 'timer', color: theme.colors.success.DEFAULT },
  ], [streakQuery.data, progressionQuery.data, statsQuery.stats, theme]);

  useEffect(() => {
    let mounted = true;
    const load = async (): Promise<void> => {
      if (!userId) { if (mounted) { setMastery(makeMastery('guest')); setMasteryLoading(false); } return; }
      setMasteryLoading(true);
      try {
        const next = await MasteryService.getOrCreateMasteryStateAsync(userId);
        if (mounted) {setMastery(next);}
      } catch (error) {
        captureSilentFailure(error, { feature: 'screens', operation: 'mastery-load', type: 'network' });
        if (mounted) {setMastery(MasteryService.getOrCreateMasteryState(userId));}
      } finally {
        if (mounted) {setMasteryLoading(false);}
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  return { mastery, masteryLoading, rankDisplay, progressionQuery, streakQuery, statsQuery, loading, hasStatsError, xpPercent, stats, theme };
}

