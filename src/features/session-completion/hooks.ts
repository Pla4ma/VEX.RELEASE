import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useProgressionSummary } from '../progression/hooks';
import { useStreakMultiplier } from '../streaks/hooks';
import { useUserSquads } from '../squads/hooks';
import { spectacleService, SpectacleType } from '../spectacle';
import type { SessionStackParams } from '../../navigation/types';
import { getSessionService } from '../../session/SessionService';
import type { SessionSummary } from '../../session/types';
import { useAuthStore } from '../../store';
import { useSessionUIStore } from '../../store/session-state';
import { useToast } from '../../shared/ui/components/Toast';
import { useTheme } from '../../theme';
import { formatDuration } from '../../screens/session/utils';
import {
  getChestTierDisplay,
  getGradeDisplay,
  getPurityDisplay,
} from '../../screens/session/utils/session-complete-display';
import { useSessionMastery } from '../../screens/session/hooks/useSessionMastery';
import { useSessionCompleteRewards } from '../../screens/session/hooks/useSessionCompleteRewards';
import { useSessionCompleteStudyProgress } from '../../screens/session/hooks/useSessionCompleteStudyProgress';
import {
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
} from './service';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

export function useSessionCompleteController(input: {
  sessionId: string;
  summary: SessionSummary;
}) {
  const { sessionId, summary } = input;
  const navigation = useNavigation<SessionNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { show: showToast } = useToast();
  const showHomeHighlight = useSessionUIStore((state) => state.showHomeHighlight);
  const scrollRef = useRef<ScrollView>(null);
  const [selectedMood, setSelectedMood] = useState<
    'BAD' | 'GOOD' | 'GREAT' | 'NEUTRAL' | 'TERRIBLE' | null
  >(null);
  const [reflection, setReflection] = useState('');
  const userId = user?.id ?? '';
  const progressionQuery = useProgressionSummary(userId || null);
  const squadsQuery = useUserSquads(userId || undefined);
  const streakQuery = useStreakMultiplier(userId || null);
  const { masteryState, setMasteryState, applySessionMastery } =
    useSessionMastery(userId, showToast);
  const sessionEntryQuery = useQuery({
    enabled: Boolean(userId && sessionId),
    queryFn: async () => {
      const sessionService = getSessionService();
      sessionService.setUserId(userId);
      return sessionService.getSessionById(sessionId);
    },
    queryKey: ['session-history-entry', userId, sessionId],
    staleTime: 30 * 1000,
  });
  const studyProgressState = useSessionCompleteStudyProgress({
    notes: sessionEntryQuery.data?.config.notes,
    tags: sessionEntryQuery.data?.config.tags,
  });
  const focusedDuration =
    summary.effectiveDuration || summary.actualDuration || summary.plannedDuration;
  const focusPurityScore = summary.focusPurityScore ?? summary.focusQuality ?? 100;
  const refetchProgressionSummary = useCallback(
    async () => (await progressionQuery.refetch()).data ?? undefined,
    [progressionQuery],
  );
  const rewards = useSessionCompleteRewards({
    applySessionMastery,
    focusedDuration,
    focusPurityScore,
    primarySquadId: squadsQuery.data?.[0]?.id ?? null,
    progressionSummary: progressionQuery.data ?? undefined,
    refetchProgressionSummary,
    sessionId,
    showToast,
    streakMultiplier: streakQuery.data?.multiplier ?? 1,
    summary,
    userId,
  });
  const hero = useMemo(
    () =>
      buildSessionCompletionHero({
        focusedDurationLabel: formatDuration(focusedDuration),
        interruptions: summary.interruptions,
        streakIncreased: summary.streakIncreased ?? false,
      }),
    [focusedDuration, summary.interruptions, summary.streakIncreased],
  );
  const returnPlan = useMemo(
    () =>
      buildSessionCompletionReturnPlan({
        completionPercentage: summary.completionPercentage,
        hasStudyFollowUp: Boolean(studyProgressState.studyProgress),
        streakDays: summary.streakDays ?? 0,
        streakIncreased: summary.streakIncreased ?? false,
      }),
    [
      studyProgressState.studyProgress,
      summary.completionPercentage,
      summary.streakDays,
      summary.streakIncreased,
    ],
  );
  const finishSession = useCallback(
    (skipped: boolean) => {
      Sentry.addBreadcrumb({
        category: 'session',
        data: skipped
          ? undefined
          : { mood: selectedMood ?? 'SKIPPED', reflectionLength: reflection.trim().length },
        level: 'info',
        message: skipped
          ? 'Session completion notes skipped'
          : 'Session completion notes submitted',
      });
      showHomeHighlight({
        message: returnPlan.highlightMessage,
        title: returnPlan.highlightTitle,
        tone: returnPlan.highlightTone,
      });
      navigation.navigate({ name: 'Main', params: {} });
    },
    [navigation, reflection, returnPlan, selectedMood, showHomeHighlight],
  );
  const grade = getGradeDisplay(summary.finalScore ?? 0, theme);
  const purity = getPurityDisplay(focusPurityScore, theme);
  const chestTier = rewards.chestResult
    ? getChestTierDisplay(rewards.chestResult.tier, theme)
    : null;
  const levelMetric =
    !progressionQuery.error && progressionQuery.data
      ? {
          accent: theme.colors.primary[500],
          id: 'level',
          label: 'Level XP',
          progress: progressionQuery.data.progressPercent / 100,
          reward: `+${rewards.chestResult?.xpReward ?? summary.xpEarned} XP`,
          value: `Level ${progressionQuery.data.level} ${progressionQuery.data.xp}/${progressionQuery.data.nextLevelThreshold} XP`,
        }
      : null;

  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'session',
      level: 'info',
      message: 'Session complete screen viewed',
    });
  }, []);

  useEffect(() => {
    if (rewards.revealStage === 1) {scrollRef.current?.scrollTo({ animated: true, y: 320 });}
    if (rewards.revealStage === 2) {scrollRef.current?.scrollTo({ animated: true, y: 720 });}
  }, [rewards.revealStage]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate({ name: 'Main', params: {} });
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  // PHASE D: Trigger spectacle ceremonies for major achievements
  useEffect(() => {
    if (!userId) {return;}

    // Trigger streak milestone spectacle for 7, 14, 30, 60, 100 day streaks
    if (summary.streakIncreased && summary.streakDays) {
      const milestones: number[] = [7, 14, 30, 60, 100];
      if (milestones.includes(summary.streakDays)) {
        spectacleService.triggerSpectacle(SpectacleType.STREAK_MILESTONE, {
          userId,
          streakDays: summary.streakDays,
          timestamp: Date.now(),
          milestone: summary.streakDays as 7 | 14 | 30 | 60 | 100,
        });
      }
    }

    // Trigger perfect session spectacle for S-grade high-purity sessions
    if (summary.finalScore && summary.finalScore >= 95 && focusPurityScore >= 95) {
      spectacleService.triggerSpectacle(SpectacleType.PERFECT_SESSION, {
        userId,
        sessionId,
        timestamp: Date.now(),
        duration: summary.actualDuration || 0,
        purity: focusPurityScore,
      });
    }
  }, [userId, summary, sessionId, focusPurityScore]);

  return {
    chestTier,
    finishSession,
    focusPurityScore,
    focusedDuration,
    formatDuration,
    grade,
    hero,
    levelMetric,
    masteryState,
    navigation,
    progressionError: progressionQuery.error,
    progressionLoading: progressionQuery.isLoading,
    purity,
    reflection,
    returnPlan,
    rewards,
    scrollRef,
    selectedMood,
    setMasteryState,
    setReflection,
    setSelectedMood,
    studyProgress: studyProgressState.studyProgress,
    summary,
    theme,
    userId,
  };
}
