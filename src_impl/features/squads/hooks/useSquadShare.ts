import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Share, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import * as repository from '../repository';
import type { SquadSummary } from '../schemas';
import { buildSquadCode, buildSquadShareMessage, getEmptyWeeklyStats } from '../share';
import { SquadShareCard } from '../components/SquadShareCard';

export function useSquadShare(squad: SquadSummary | null | undefined) {
  const { theme } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const squadCode = squad ? buildSquadCode(squad.id) : '';
  const statsQuery = useQuery({
    queryKey: ['squads', 'share-card', squad?.id ?? ''],
    queryFn: () => repository.fetchSquadWeeklyStats(squad!.id),
    enabled: Boolean(squad?.id),
    staleTime: 60_000,
  });

  const handleShare = useCallback(async () => {
    if (!squad) {return;}
    setIsSharing(true);
    try {
      const weeklyStats = statsQuery.data ?? getEmptyWeeklyStats();
      await Share.share({
        message: buildSquadShareMessage(squad, weeklyStats, squadCode),
        url: `https://vex.app/squad/${squadCode}`,
      });
    } finally {
      setIsSharing(false);
    }
  }, [squad, squadCode, statsQuery.data]);

  const shareCard = useMemo(() => {
    if (!squad) {return null;}
    if (statsQuery.isLoading) {
      return React.createElement(
        View,
        { style: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: theme.spacing[3] } },
        React.createElement(ActivityIndicator, { color: theme.colors.primary[500] }),
        React.createElement(Text, { variant: 'bodySmall', color: theme.colors.text.secondary }, 'Building your squad card...')
      );
    }

    if (statsQuery.isError) {
      return React.createElement(
        View,
        { style: { minHeight: 260, justifyContent: 'center', gap: theme.spacing[2] } },
        React.createElement(Text, { variant: 'h4', color: theme.colors.text.primary }, 'Could not load squad stats'),
        React.createElement(
          Text,
          { variant: 'bodySmall', color: theme.colors.text.secondary },
          "We can still share your invite link, but this week's totals are unavailable right now."
        )
      );
    }

    return React.createElement(SquadShareCard, {
      squad,
      weeklyStats: statsQuery.data ?? getEmptyWeeklyStats(),
    });
  }, [squad, squadCode, statsQuery.data, statsQuery.isError, statsQuery.isLoading, theme.colors.primary, theme.colors.text, theme.spacing]);

  return { shareCard, handleShare, isSharing };
}
