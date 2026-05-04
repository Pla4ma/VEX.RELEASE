import React, { useEffect, useMemo, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useActiveBoss, useAvailableBosses, useBossTemplates, useCreateEncounter } from '../../../features/boss/hooks';
import { RealTimeBossCombat } from '../../../features/boss-realtime/components/RealTimeBossCombat';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useMidSessionEvents } from '../../../features/session-events';
import { useTheme } from '../../../theme';
import { buildSessionBossCombatEncounter } from '../utils/session-boss-combat';

type ActiveSessionBossCombatProps = {
  elapsedSeconds: number;
  isPaused: boolean;
  purityScore: number;
  sessionDurationSeconds: number;
  sessionId: string;
  userId: string;
};

export function ActiveSessionBossCombat({
  elapsedSeconds,
  isPaused,
  purityScore,
  sessionDurationSeconds,
  sessionId,
  userId,
}: ActiveSessionBossCombatProps): JSX.Element | null {
  const { theme } = useTheme();
  const progressionSummary = useProgressionSummary(userId || null);
  const userLevel = progressionSummary.data?.level;
  const bossTemplates = useBossTemplates();
  const activeBoss = useActiveBoss(userId || null);
  const availableBosses = useAvailableBosses(userLevel ? userId || null : null, userLevel ?? 1);
  const createEncounter = useCreateEncounter();
  const [spawnAttemptedBossId, setSpawnAttemptedBossId] = useState<string | null>(null);

  const nextBoss = useMemo(
    () => availableBosses.data?.find((entry) => entry.unlocked && !entry.defeated)?.template ?? null,
    [availableBosses.data],
  );
  const activeBossTaunts = useMemo(
    () => bossTemplates.data?.find((template) => template.id === activeBoss.data?.bossId)?.taunts ?? null,
    [activeBoss.data?.bossId, bossTemplates.data],
  );

  useMidSessionEvents({
    bossHealthPercent: activeBoss.data?.percentHealthRemaining ?? null,
    bossTaunts: activeBossTaunts,
    elapsedSeconds,
    enabled: Boolean(userId && sessionId && activeBoss.data),
    isPaused,
    purityScore,
    sessionDurationSeconds,
    sessionId,
  });

  useEffect(() => {
    if (!userId || !userLevel || activeBoss.isPending || activeBoss.data || !nextBoss || createEncounter.isPending) {
      return;
    }
    if (spawnAttemptedBossId === nextBoss.id) {
      return;
    }
    setSpawnAttemptedBossId(nextBoss.id);
    createEncounter.mutate(
      { bossId: nextBoss.id, userId, userLevel },
      {
        onError: (caught) => {
          Sentry.captureException(caught, { tags: { feature: 'active-session-boss-spawn' } });
        },
      },
    );
  }, [activeBoss.data, activeBoss.isPending, createEncounter, nextBoss, spawnAttemptedBossId, userId, userLevel]);

  const encounter = useMemo(() => {
    if (!activeBoss.data || !sessionId) {
      return null;
    }
    return buildSessionBossCombatEncounter(activeBoss.data, {
      elapsedSeconds,
      sessionDurationSeconds,
      sessionId,
      userId,
    });
  }, [activeBoss.data, elapsedSeconds, sessionDurationSeconds, sessionId, userId]);

  if (!userId || !sessionId) {
    return null;
  }

  if (progressionSummary.isPending || activeBoss.isPending || availableBosses.isPending || bossTemplates.isPending || createEncounter.isPending) {
    return (
      <Box mx="md" mb="md" p="md" bg="background.elevated" borderRadius={theme.borderRadius.lg}>
        <Text variant="body" color="text.secondary">
          Summoning your current boss...
        </Text>
      </Box>
    );
  }

  if (activeBoss.isError) {
    return (
      <Box mx="md" mb="md" p="md" bg="background.elevated" borderRadius={theme.borderRadius.lg}>
        <Text variant="body" color="error.DEFAULT" mb="sm">
          Boss sync is disrupted. Your session can still finish safely.
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => void activeBoss.refetch()}
          accessibilityLabel="Retry boss combat sync"
          accessibilityHint="Attempts to reload the active boss encounter for this session"
        >
          Retry Boss Sync
        </Button>
      </Box>
    );
  }

  if (progressionSummary.isError || availableBosses.isError || bossTemplates.isError || createEncounter.isError) {
    return (
      <Box mx="md" mb="md" p="md" bg="background.elevated" borderRadius={theme.borderRadius.lg}>
        <Text variant="body" color="error.DEFAULT" mb="sm">
          VEX could not prepare the next boss. The timer still counts and rewards still sync.
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            createEncounter.reset();
            setSpawnAttemptedBossId(null);
            void availableBosses.refetch();
            void bossTemplates.refetch();
          }}
          accessibilityLabel="Retry boss preparation"
          accessibilityHint="Attempts to reload boss templates and prepare an active encounter"
        >
          Retry Boss Prep
        </Button>
      </Box>
    );
  }

  if (!encounter) {
    return (
      <Box mx="md" mb="md" p="md" bg="background.elevated" borderRadius={theme.borderRadius.lg}>
        <Text variant="body" color="text.secondary">
          No boss is available at this level. Finish this session to push progression forward.
        </Text>
      </Box>
    );
  }

  return (
    <RealTimeBossCombat
      key={encounter.id}
      encounter={encounter}
      elapsedSeconds={elapsedSeconds}
      purityScore={purityScore}
      isPaused={isPaused}
      onVictory={() => {
        Sentry.addBreadcrumb({ category: 'boss', message: 'Active session boss victory preview', level: 'info' });
      }}
    />
  );
}
