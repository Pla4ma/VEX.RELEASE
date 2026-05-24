import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, ScrollView } from 'react-native';
import { buildCompletionCoachPresence, type CoachPresenceMotivationStyle } from '../../coach-presence';
import { fetchCoachPresenceMemorySummary } from '../../coach-presence/repository';
import { useFeatureAccess, getFeatureAvailability } from '../../liveops-config';
import { useOnboardingStore } from '../../onboarding/store';
import { useProgressionSummary } from '../../progression/hooks';
import { useStreakMultiplier } from '../../streaks/hooks';
import { useUserSquads } from '../../squads/hooks';
import type { SessionStackParams } from '../../../navigation/types';
import { getSessionService } from '../../../session/SessionService';
import type { SessionSummary } from '../../../session/types';
import { useAuthStore } from '../../../store';
import { useSessionUIStore } from '../../../store/session-state';
import { useToast } from '../../../shared/ui/components/Toast';
import { useTheme } from '../../../theme';
import { useSessionCompleteRewards } from '../../../screens/session/hooks/useSessionCompleteRewards';
import { useSessionCompleteStudyProgress } from '../../../screens/session/hooks/useSessionCompleteStudyProgress';
import { useSessionMastery } from '../../../screens/session/hooks/useSessionMastery';
import { formatDuration } from '../../../screens/session/utils';
import { getGradeDisplay, getPurityDisplay } from '../../../screens/session/utils/session-complete-display';
import { buildPostSessionNextAction, buildSessionCompletionHero, buildSessionCompletionReturnPlan } from '../service';
import { useHomeReturnCompletionSync } from './useHomeReturnCompletionSync';
import { useSessionCompletionSpectacles } from './useSessionCompletionSpectacles';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

export function useSessionCompleteController(input: { sessionId: string; summary: SessionSummary }) {
  const { sessionId, summary } = input;
  const navigation = useNavigation<SessionNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { show: showToast } = useToast();
  const disclosure = useFeatureAccess();
  const motivationProfile = useOnboardingStore((state) => state.motivationProfile);
  const showHomeHighlight = useSessionUIStore((state) => state.showHomeHighlight);
  const scrollRef = useRef<ScrollView>(null);
  const [selectedMood, setSelectedMood] = useState<'BAD' | 'GOOD' | 'GREAT' | 'NEUTRAL' | 'TERRIBLE' | null>(null);
  const [reflection, setReflection] = useState('');
  const userId = user?.id ?? '';
  const focusedDuration = summary.effectiveDuration || summary.actualDuration || summary.plannedDuration;
  const focusPurityScore = summary.focusPurityScore ?? summary.focusQuality ?? 100;

  const coachMemoryQuery = useQuery({
    enabled: Boolean(userId),
    queryFn: () => fetchCoachPresenceMemorySummary(userId),
    queryKey: ['coach-presence', 'completion-memory', userId],
    staleTime: 300000,
  });
  const syncHomeReturn = useHomeReturnCompletionSync({ sessionId, summary, userId });
  const progressionQuery = useProgressionSummary(userId || null);
  const squadsAvailability = getFeatureAvailability(disclosure.features.squads);
  const squadsQuery = useUserSquads(
    squadsAvailability.canQuery ? (userId || undefined) : undefined,
    { enabled: squadsAvailability.canQuery, staleTime: 1000 * 60 * 5 },
  );
  const streakQuery = useStreakMultiplier(userId || null);
  const { masteryState, setMasteryState, applySessionMastery } = useSessionMastery(userId, showToast);

  const sessionEntryQuery = useQuery({
    enabled: Boolean(userId && sessionId),
    queryFn: async () => {
      const sessionService = getSessionService();
      sessionService.setUserId(userId);
      return sessionService.getSessionById(sessionId);
    },
    queryKey: ['session-history-entry', userId, sessionId],
    staleTime: 30000,
  });
  const studyProgressState = useSessionCompleteStudyProgress({
    notes: sessionEntryQuery.data?.config.notes,
    tags: sessionEntryQuery.data?.config.tags,
  });

  const coachPresence = useMemo(
    () => buildCompletionCoachPresence({
      featureAvailability: {
        focus: getFeatureAvailability(disclosure.features.focus_session),
        progress: getFeatureAvailability(disclosure.features.progress_view),
        study: getFeatureAvailability(disclosure.features.content_study),
      },
      memorySummary: coachMemoryQuery.data ?? {
        coachMemoryCount: 0, companionMemoryCount: 0, latestMemory: null, syncAvailable: false,
      },
      motivationStyle: mapCompletionMotivationStyle(motivationProfile?.primary),
      summary: {
        durationMinutes: Math.round(focusedDuration / 60),
        focusPurityScore,
        isComeback: summary.streakDays === 1 && !summary.streakIncreased,
        isFirstSession: summary.streakDays <= 1 && summary.userLevel <= 1,
        isHighFocusStreak: focusPurityScore >= 90,
        isLowEnergyDay: summary.mood === 'STRUGGLING' || summary.mood === 'DIFFICULT',
        isStreakRecovery: !summary.streakMaintained && summary.streakIncreased,
        sessionMode: summary.sessionMode,
        streakDays: summary.streakDays ?? 0,
      },
    }),
    [coachMemoryQuery.data, disclosure.features, focusPurityScore, focusedDuration, motivationProfile?.primary, summary],
  );

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
    () => buildSessionCompletionHero({
      focusedDurationLabel: coachPresence.sessionReflection,
      interruptions: summary.interruptions,
      streakIncreased: summary.streakIncreased ?? false,
    }),
    [coachPresence.sessionReflection, summary.interruptions, summary.streakIncreased],
  );
  const returnPlan = useMemo(
    () => buildSessionCompletionReturnPlan({
      completionPercentage: summary.completionPercentage,
      hasStudyFollowUp: Boolean(studyProgressState.studyProgress),
      streakDays: summary.streakDays ?? 0,
      streakIncreased: summary.streakIncreased ?? false,
    }),
    [studyProgressState.studyProgress, summary.completionPercentage, summary.streakDays, summary.streakIncreased],
  );
  const nextAction = useMemo(() => {
    try {
      return buildPostSessionNextAction({ summary });
    } catch (error) {
      Sentry.captureException(error, { tags: { feature: 'session-completion', operation: 'next-action' } });
      return null;
    }
  }, [summary]);
  const finishSession = useCallback((skipped: boolean) => {
    Sentry.addBreadcrumb({
      category: 'session',
      data: skipped ? undefined : { mood: selectedMood ?? 'SKIPPED', reflectionLength: reflection.trim().length },
      level: 'info',
      message: skipped ? 'Session completion notes skipped' : 'Session completion notes submitted',
    });
    syncHomeReturn().catch(() => undefined);
    showHomeHighlight({ message: returnPlan.highlightMessage, title: returnPlan.highlightTitle, tone: returnPlan.highlightTone });
    navigation.navigate({ name: 'Main', params: {} });
  }, [navigation, reflection, returnPlan, selectedMood, showHomeHighlight, syncHomeReturn]);
  const grade = getGradeDisplay(summary.finalScore ?? 0, theme);
  const purity = getPurityDisplay(focusPurityScore, theme);
  const levelMetric = !progressionQuery.error && progressionQuery.data
    ? {
        accent: theme.colors.primary[500],
        id: 'level',
        label: 'Level XP',
        progress: progressionQuery.data.progressPercent / 100,
        reward: `+${summary.xpEarned ?? 0} XP`,
        value: `Level ${progressionQuery.data.level} ${progressionQuery.data.xp}/${progressionQuery.data.nextLevelThreshold} XP`,
      }
    : null;

  useEffect(() => {
    Sentry.addBreadcrumb({ category: 'session', level: 'info', message: 'Session complete screen viewed' });
  }, []);
  useEffect(() => {
    if (rewards.revealStage === 1) { scrollRef.current?.scrollTo({ animated: true, y: 320 }); }
    if (rewards.revealStage === 2) { scrollRef.current?.scrollTo({ animated: true, y: 720 }); }
  }, [rewards.revealStage]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate({ name: 'Main', params: {} });
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  useSessionCompletionSpectacles({ focusPurityScore, sessionId, summary, userId });

  return { coachPresence, finishSession, focusPurityScore, focusedDuration, formatDuration, grade, hero, levelMetric, masteryState, navigation, nextAction, progressionError: progressionQuery.error, progressionLoading: progressionQuery.isLoading, purity, reflection, returnPlan, rewards, scrollRef, selectedMood, setMasteryState, setReflection, setSelectedMood, studyProgress: studyProgressState.studyProgress, summary, theme, userId };
}

function mapCompletionMotivationStyle(input: string | undefined): CoachPresenceMotivationStyle {
  if (input === 'student') { return 'STUDY_FOCUSED'; }
  if (input === 'friendly') { return 'FRIENDLY'; }
  if (input === 'game_like' || input === 'competitive') { return 'GAME_LIKE'; }
  if (input === 'coach_led') { return 'COACH_LED'; }
  if (input === 'intense') { return 'INTENSE'; }
  return 'CALM';
}
