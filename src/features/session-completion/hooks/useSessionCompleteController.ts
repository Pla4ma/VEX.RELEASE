import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Sentry from "@sentry/react-native";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView } from "react-native";

import { fetchCoachPresenceMemorySummary } from "../../coach-presence/repository";
import { useFeatureAccess } from "../../liveops-config";
import { useOnboardingStore } from "../../onboarding/store";
import { useProgressionSummary } from "../../progression/hooks";
import { useStreakMultiplier } from "../../streaks/hooks";
import type { SessionStackParams } from "../../../navigation/types";
import { getSessionService } from "../../../session/SessionService";
import type { SessionSummary } from "../../../session/types";
import { useAuthStore } from "../../../store";
import { useSessionUIStore } from "../../../store/session-state";
import { useToast } from "../../../shared/ui/components/Toast";
import { useTheme } from "../../../theme";
import { useSessionCompleteRewards } from "../../../screens/session/hooks/useSessionCompleteRewards";
import { useSessionCompleteStudyProgress } from "../../../screens/session/hooks/useSessionCompleteStudyProgress";
import { useSessionMastery } from "../../../screens/session/hooks/useSessionMastery";
import { formatDuration } from "../../../screens/session/utils";
import { useHomeReturnCompletionSync } from "./useHomeReturnCompletionSync";
import { useSessionCompleteCoachPresence } from "./useSessionCompleteCoachPresence";
import { useSessionCompleteDerivedData } from "./useSessionCompleteDerivedData";
import { useSessionCompleteActions } from "./useSessionCompleteActions";

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
  const disclosure = useFeatureAccess();
  const motivationProfile = useOnboardingStore(
    (state) => state.motivationProfile,
  );
  const showHomeHighlight = useSessionUIStore(
    (state) => state.showHomeHighlight,
  );
  const scrollRef = useRef<ScrollView>(null);
  const [selectedMood, setSelectedMood] = useState<
    "BAD" | "GOOD" | "GREAT" | "NEUTRAL" | "TERRIBLE" | null
  >(null);
  const [reflection, setReflection] = useState("");
  const userId = user?.id ?? "";
  const focusedDuration =
    summary.effectiveDuration ||
    summary.actualDuration ||
    summary.plannedDuration;
  const focusPurityScore =
    summary.focusPurityScore ?? summary.focusQuality ?? 100;

  const coachMemoryQuery = useQuery({
    enabled: Boolean(userId),
    queryFn: () => fetchCoachPresenceMemorySummary(userId),
    queryKey: ["coach-presence", "completion-memory", userId],
    staleTime: 300000,
  });
  const syncHomeReturn = useHomeReturnCompletionSync({
    sessionId,
    summary,
    userId,
  });
  const progressionQuery = useProgressionSummary(userId || null);
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
    queryKey: ["session-history-entry", userId, sessionId],
    staleTime: 30000,
  });
  const studyProgressState = useSessionCompleteStudyProgress({
    notes: sessionEntryQuery.data?.config.notes,
    tags: sessionEntryQuery.data?.config.tags,
  });

  const coachPresence = useSessionCompleteCoachPresence({
    coachMemoryData: coachMemoryQuery.data,
    features: disclosure.features,
    focusPurityScore,
    focusedDuration,
    motivationProfile: motivationProfile?.primary,
    summary,
  });

  const refetchProgressionSummary = useCallback(
    async () => (await progressionQuery.refetch()).data ?? undefined,
    [progressionQuery],
  );
  const rewards = useSessionCompleteRewards({
    applySessionMastery,
    focusedDuration,
    focusPurityScore,
    primarySquadId: null,
    progressionSummary: progressionQuery.data ?? undefined,
    refetchProgressionSummary,
    sessionId,
    showToast,
    streakMultiplier: streakQuery.data?.multiplier ?? 1,
    summary,
    userId,
  });

  const { grade, hero, levelMetric, nextAction, purity, returnPlan } =
    useSessionCompleteDerivedData({
      coachPresenceSessionReflection: coachPresence.sessionReflection,
      focusPurityScore,
      progressionData: progressionQuery.data ?? undefined,
      progressionError: progressionQuery.error,
      studyProgress: studyProgressState.studyProgress,
      summary,
      theme,
    });

  const { finishSession } = useSessionCompleteActions({
    navigation,
    reflection,
    returnPlan,
    selectedMood,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showHomeHighlight: showHomeHighlight as any,
    syncHomeReturn,
  });

  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "session",
      level: "info",
      message: "Session complete screen viewed",
    });
  }, []);
  useEffect(() => {
    if (rewards.completionStage === 1) {
      scrollRef.current?.scrollTo({ animated: true, y: 320 });
    }
    if (rewards.completionStage === 2) {
      scrollRef.current?.scrollTo({ animated: true, y: 720 });
    }
  }, [rewards.completionStage]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate({ name: "Main", params: {} });
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  return {
    coachPresence,
    finishSession,
    focusPurityScore,
    focusedDuration,
    formatDuration,
    grade,
    hero,
    levelMetric,
    masteryState,
    navigation,
    nextAction,
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
