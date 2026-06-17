import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  useReducedMotion,
} from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { ErrorState } from '../../components/states/ErrorState';
import {
  type CompanionState,
} from '../../features/companion/types';
import { LivingCompanion } from '../../features/companion/components/LivingCompanion';
import {
  loadCompanionState,
  loadRecentSessionMoods,
} from '../../features/companion/session-storage';
import { useCompanionMemories } from '../../features/companion/memory-hooks';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import { CompanionMemoryTimeline } from '../../features/companion/components/CompanionMemoryTimeline';
import type { ExtendedRootStackParams } from '../../navigation/types';
import {
  CompanionScreenSkeleton,
  PHASE_NAMES,
} from './components/CompanionScreenSupport';
import {
  CompanionStatsBar,
  type SessionMoodEntry,
} from './components/CompanionStatsBar';

function getHeroHeight(screenHeight: number): number {
  return screenHeight * 0.6;
}

type LoadState =
  | { status: 'empty' }
  | { error: Error; status: 'error' }
  | { status: 'loading' }
  | {
      companion: CompanionState;
      moodHistory: SessionMoodEntry[];
      status: 'success';
    };

export function CompanionScreen(): React.ReactNode {
  const { theme } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = getHeroHeight(screenHeight);
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const reducedMotion = useReducedMotion();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const memories = useCompanionMemories(userId);
  const load = useCallback(async (): Promise<void> => {
    if (!userId) {
      setLoadState({ status: 'empty' });
      return;
    }
    setLoadState({ status: 'loading' });
    try {
      const [companion, moodHistory] = await Promise.all([
        loadCompanionState(userId),
        loadRecentSessionMoods(userId, 5),
      ]);
      setLoadState({ companion, moodHistory, status: 'success' });
    } catch (caught: unknown) {
      setLoadState({
        error: caught instanceof Error ? caught : new Error(String(caught)),
        status: 'error',
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadState.status === 'loading') {
    return <CompanionScreenSkeleton heroHeight={heroHeight} />;
  }
  if (loadState.status === 'empty') {
    return (
      <Box
        flex={1}
        bg="background.primary"
        justifyContent="center"
        alignItems="center"
        p="xl"
      >
        <Text variant="h4" color="text.primary" textAlign="center">
          Your companion needs an active profile.
        </Text>
      </Box>
    );
  }
  if (loadState.status === 'error') {
    return (
      <ErrorState
        title="Companion details did not load"
        description="VEX kept the session safe. Retry the companion profile."
        retryLabel="Retry companion"
        onRetry={load}
      />
    );
  }

  const { companion, moodHistory } = loadState;
  const fadeIn = reducedMotion ? undefined : FadeIn.duration(600);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background.primary, flex: 1 }}
      contentContainerStyle={{ paddingBottom: theme.spacing[5] }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={fadeIn}>
        <Box
          height={heroHeight}
          bg="background.secondary"
          justifyContent="center"
          alignItems="center"
        >
          <LivingCompanion
            companionState={companion}
            elapsedSeconds={0}
            isPaused={false}
            purityScore={85}
            sessionProgress={0}
            totalSeconds={1800}
          />
          <Box
            position="absolute"
            px="md"
            py="sm"
            borderRadius="full"
            bg="background.tertiary"
            style={{ right: theme.spacing[4], top: theme.spacing[4] }}
          >
            <Text variant="caption" color="text.primary" fontWeight="600">
              {PHASE_NAMES[companion.phase]} Phase
            </Text>
          </Box>
        </Box>
      </Animated.View>
      <CompanionStatsBar
        companion={companion}
        moodHistory={moodHistory}
        reducedMotion={reducedMotion}
      />
      <Box px="lg" pb="xl">
        <CompanionMemoryTimeline
          isError={memories.isError}
          isPending={memories.isPending}
          memories={memories.data}
          onRetry={memories.refetch}
          onStartFocus={() =>
            navigation.navigate({ name: 'SessionSetup', params: {} })
          }
        />
      </Box>
    </ScrollView>
  );
}

export default withScreenErrorBoundary(CompanionScreen, 'Companion');
