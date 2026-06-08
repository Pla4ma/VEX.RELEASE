import { useEffect, useMemo, useState } from 'react';
import { captureSilentFailure } from '../../utils/silent-failure';
import { useProgressionSummary } from '../../features/progression/hooks';
import { useStreakSummary } from '../../features/streaks/hooks';
import { useSessionStats } from '../../session/hooks/useSession';
import { useWallet } from '../../features/economy/hooks';
import { getFeatureStatus } from '../../features/liveops-config';
import {
  getMasteryRankDisplay,
  type MasteryState,
} from '../../features/mastery/types';
import { MasteryService } from '../../features/mastery/service';
import { useTheme } from '../../theme';
import type { ProfileStatItem } from '../../screens/profile/components/ProfileStatTile';

export interface UseProfileDataResult {
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: ReturnType<typeof getMasteryRankDisplay>;
  progressionQuery: ReturnType<typeof useProgressionSummary>;
  streakQuery: ReturnType<typeof useStreakSummary>;
  statsQuery: ReturnType<typeof useSessionStats>;
  walletQuery: ReturnType<typeof useWallet>;
  theme: ReturnType<typeof useTheme>['theme'];
  loading: boolean;
  hasStatsError: boolean;
  xpPercent: number;
  stats: ProfileStatItem[];
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
  const walletQuery = useWallet(userId ?? '', {
    enabled: getFeatureStatus('economy_advanced') !== 'hidden',
  });
  const rankDisplay = getMasteryRankDisplay(mastery.rank);
  const xpPercent = Math.max(0, Math.min(100, progressionQuery.data?.progressPercent ?? 0));
  const loading = progressionQuery.isPending || streakQuery.isPending ||
    statsQuery.isLoading || walletQuery.isPending;
  const hasStatsError = !!(progressionQuery.error || streakQuery.error || walletQuery.error);

  const stats = useMemo<ProfileStatItem[]>(() => [
    { label: 'Current Streak', value: `${streakQuery.data?.currentDays ?? 0} days`, icon: 'fire', iconOrb: 'fire' as const, change: undefined },
    { label: 'Longest Streak', value: `${streakQuery.data?.longestDays ?? 0} days`, icon: 'calendar', iconOrb: 'pearl' as const, change: undefined },
    { label: 'Level', value: `${progressionQuery.data?.level ?? 1}`, icon: 'star', iconOrb: 'mint' as const, change: undefined },
    { label: 'Total Sessions', value: `${statsQuery.stats?.totalSessions ?? 0}`, icon: 'activity', iconOrb: 'cyan' as const, change: undefined },
    { label: 'Focus Hours', value: hours(statsQuery.stats?.totalFocusTime ?? 0), icon: 'clock', iconOrb: 'amber' as const, change: undefined },
    { label: 'Coins', value: `${walletQuery.data?.coins ?? 0}`, icon: 'gem', iconOrb: 'lavender' as const, change: undefined },
  ], [streakQuery.data, progressionQuery.data, statsQuery.stats, walletQuery.data]);

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

  return { mastery, masteryLoading, rankDisplay, progressionQuery, streakQuery, statsQuery, walletQuery, theme, loading, hasStatsError, xpPercent, stats };
}
