import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelectableThemes } from '../themes/hooks';
import { getSessionThemeById, type SessionTheme } from '../themes/session-themes';
import { useStreak } from '../streaks/hooks';
import { useNetInfo } from '../../network';
import type { SessionStackParams } from '../../navigation/types';
import { useAuthStore } from '../../store';
import { useActiveStudyPlan } from '../content-study/hooks';
import { useLearningExecutionLayer } from '../learning-execution';
import {
  parseSessionSetupParams,
  buildSessionStartHero,
  buildSessionStartSummary,
  getOfflineSessionStartMessage,
  buildSessionStake,
} from './service';
import type { SessionStake } from './schemas';
import { useSessionSetupState } from '../../screens/session/hooks/useSessionSetupState';
import { useStartSessionFlow } from '../../screens/session/hooks/useStartSessionFlow';
import { PRESETS } from '../../screens/session/utils/session-setup';

type SessionSetupRouteParams = SessionStackParams['SessionSetup'];
type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

export function useSessionStartController(input: {
  navigation: SessionNavigationProp;
  routeParams: SessionSetupRouteParams | undefined;
  focusContractText?: string | null;
}) {
  const { navigation, routeParams, focusContractText = null } = input;
  const { user } = useAuthStore();
  const { isOffline } = useNetInfo();
  const { data: streak } = useStreak(user?.id ?? null);
  const activeStudyPlan = useActiveStudyPlan();
  const learningExecutionLayer = useLearningExecutionLayer(activeStudyPlan.data ?? null);
  const [shopTheme, setShopTheme] = useState<SessionTheme | null>(null);
  const parsedRoute = useMemo(() => parseSessionSetupParams(routeParams), [routeParams]);
  const userId = user?.id ?? '';
  const setupState = useSessionSetupState(userId, parsedRoute.params, streak?.currentDays ?? 0);
  const selectableThemesQuery = useSelectableThemes(userId || null, streak ?? null);
  const userThemes = selectableThemesQuery.data ?? [];
  const selectedTheme = useMemo(
    () => getSessionThemeById(setupState.selectedThemeId),
    [setupState.selectedThemeId],
  );
  const selectedDurationSeconds = setupState.selectedPreset.id === 'custom'
    ? setupState.customDuration * 60
    : setupState.selectedPreset.duration;
  const filteredPresets = useMemo(
    () => PRESETS.filter((preset) => preset.category === setupState.selectedCategory),
    [setupState.selectedCategory],
  );
  const activeChallenges = useMemo(
    () =>
      setupState.masteryState?.activeChallenges.filter(
        (challenge) =>
          challenge.status === 'ACTIVE' &&
          (challenge.technique === 'durationMastery' || challenge.technique === 'purityMastery'),
      ) ?? [],
    [setupState.masteryState],
  );
  const selectedThemeOwned = userThemes.find((item) => item.id === setupState.selectedThemeId)?.isOwned ?? selectedTheme.isFree;
  const sessionSummary = useMemo(
    () => buildSessionStartSummary({
      currentThemeName: selectedTheme.name,
      durationMinutes: Math.round(selectedDurationSeconds / 60),
      hasCustomizations: setupState.showCustomization,
    }),
    [selectedDurationSeconds, selectedTheme.name, setupState.showCustomization],
  );
  const sessionHero = useMemo(
    () => buildSessionStartHero({
      durationMinutes: Math.round(selectedDurationSeconds / 60),
      params: parsedRoute.params,
      presetName: setupState.selectedPreset.name,
      smartSuggestionDescription:
        setupState.smartSuggestion?.confidence && setupState.smartSuggestion.confidence >= 0.75
          ? setupState.smartSuggestion.description
          : null,
    }),
    [parsedRoute.params, selectedDurationSeconds, setupState.selectedPreset.name, setupState.smartSuggestion],
  );
  const offlineMessage = useMemo(
    () => getOfflineSessionStartMessage(isOffline),
    [isOffline],
  );
  const { clearStartError, handleStartSession, isStarting, startError } = useStartSessionFlow({
    draftGoal: setupState.draftGoal,
    focusContractText,
    navigation,
    params: parsedRoute.params,
    selectedDurationSeconds,
    selectedPreset: setupState.selectedPreset,
    selectedSessionMode: setupState.selectedSessionMode,
    selectedThemeId: setupState.selectedThemeId,
    selectedThemeOwned,
    userId,
  });

  const handleThemePress = (theme: SessionTheme) => {
    if (theme.isOwned || theme.isFree) {
      setupState.setSelectedThemeId(theme.id);
      return;
    }

    setShopTheme(theme);
  };

  return {
    activeChallenges,
    activeStudyPlan,
    clearStartError,
    filteredPresets,
    handleStartSession,
    handleThemePress,
    isStarting,
    learningExecutionLayer,
    offlineMessage,
    parsedRoute,
    selectableThemesQuery,
    selectedDurationSeconds,
    selectedTheme,
    selectedThemeOwned,
    sessionHero,
    sessionSummary,
    setupState,
    shopTheme,
    setShopTheme,
    startError,
    streak,
    user,
    userId,
    userThemes,
  };
}

// ============================================================================
// Session Stake Hook (Phase 2)
// ============================================================================

export function useSessionStake(
  userId: string,
  durationSeconds: number,
  mode: string,
  selectedLoadout?: string[]
) {
  return useQuery<SessionStake>({
    queryKey: ['session-stake', userId, durationSeconds, mode, selectedLoadout],
    queryFn: () => buildSessionStake(userId, durationSeconds, mode, selectedLoadout),
    enabled: !!userId && durationSeconds > 0,
    staleTime: 1000 * 30, // 30 seconds
  });
}
