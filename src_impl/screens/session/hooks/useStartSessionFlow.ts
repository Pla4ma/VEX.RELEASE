import { captureSilentFailure } from '../../../utils/silent-failure';
import { useCallback, useMemo, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getSprintChainService } from '../../../features/session/SprintChainService';
import { startStreakRestoreQuest } from '../../../features/streaks/restore-quest';
import type { SessionStackParams } from '../../../navigation/types';
import { getMMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { SessionMode } from '../../../session/modes';
import { useSession } from '../../../session/hooks/useSession';
import { SessionConfigSchema } from '../../../session/types';
import { sessionStart } from '../../../utils/haptics';
import type { PresetWithIcon } from '../utils/session-setup';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
type SessionSetupParams = SessionStackParams['SessionSetup'];

type UseStartSessionFlowParams = {
  draftGoal: string | undefined;
  navigation: SessionNavigationProp;
  params: SessionSetupParams | undefined;
  selectedDurationSeconds: number;
  selectedPreset: PresetWithIcon;
  selectedSessionMode: SessionMode;
  selectedThemeId: string;
  selectedThemeOwned: boolean;
  userId: string;
};

export function useStartSessionFlow({
  draftGoal,
  navigation,
  params,
  selectedDurationSeconds,
  selectedPreset,
  selectedSessionMode,
  selectedThemeId,
  selectedThemeOwned,
  userId,
}: UseStartSessionFlowParams) {
  const { createSession, startSession } = useSession(userId);
  const storage = useMemo(() => getMMKVStorageAdapter(), []);
  const sessionDraftKey = useMemo(() => `session_draft_${userId}`, [userId]);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const handleStartSession = useCallback(async () => {
    setIsStarting(true);
    setStartError(null);
    let started = false;

    try {
      const sessionTags = Array.from(new Set([...(selectedPreset.tags || []), ...(params?.sessionTags ?? [])]));
      const notesPayload: Record<string, unknown> = {};

      if (params?.source === 'content-study') {
        if (!sessionTags.includes('content-study')) {
          sessionTags.push('content-study');
        }
        if (params.studyPlanId && !sessionTags.includes(params.studyPlanId)) {
          sessionTags.push(params.studyPlanId);
        }
        if (params.focusAreas && params.focusAreas.length > 0) {
          sessionTags.push(...params.focusAreas.slice(0, 3));
        }

        notesPayload.source = params.source;
        notesPayload.generationId = params.generationId;
        notesPayload.contentId = params.contentId;
        notesPayload.studyPlanId = params.studyPlanId ?? params.generationId;
        notesPayload.focusAreas = params.focusAreas;
      }

      if (selectedThemeId && selectedThemeOwned) {
        notesPayload.selectedThemeId = selectedThemeId;
      }

      if (params?.comebackMultiplier && params.comebackMultiplier > 1) {
        if (!sessionTags.includes('comeback-session')) {
          sessionTags.push('comeback-session');
        }
        notesPayload.comebackMultiplier = params.comebackMultiplier;
        notesPayload.comebackMessage = params.comebackMessage;
      }

      if (params?.comebackQuest) {
        if (!sessionTags.includes('streak-restore-quest')) {
          sessionTags.push('streak-restore-quest');
        }
        notesPayload.comebackQuest = params.comebackQuest;
        await startStreakRestoreQuest(userId, params.comebackQuest.streakBefore);
      }

      const sprintChainState = selectedSessionMode === SessionMode.SPRINT
        ? await getSprintChainService().getState(userId)
        : null;
      const sprintChainCount = sprintChainState
        ? Math.min(4, sprintChainState.completedCount + 1)
        : 1;

      const config = SessionConfigSchema.parse({
        duration: selectedDurationSeconds,
        breakDuration: selectedPreset.breakDuration,
        longBreakDuration: selectedPreset.longBreakDuration,
        intervals: selectedPreset.intervals,
        longBreakInterval: selectedPreset.longBreakInterval,
        category: params?.sessionCategory ?? selectedPreset.category,
        tags: sessionTags,
        soundEnabled: selectedPreset.soundEnabled,
        vibrationEnabled: selectedPreset.vibrationEnabled,
        dndEnabled: selectedPreset.dndEnabled,
        strictMode: selectedPreset.strictMode,
        sessionMode: selectedSessionMode,
        studyPlanId: params?.studyPlanId ?? params?.generationId,
        sprintChainCount,
        autoStartBreaks: selectedPreset.autoStartBreaks,
        autoStartNextInterval: selectedPreset.autoStartNextInterval,
        goal: draftGoal,
        comebackMultiplier: params?.comebackMultiplier,
        warContext: params?.warContext ?? null,
        notes: Object.keys(notesPayload).length > 0 ? JSON.stringify(notesPayload) : undefined,
      });

      const session = await createSession(config);
      await startSession();
      started = true;

      // Trigger haptic for session start success
      await sessionStart();

      // Double haptic for DEEP_WORK mode - signals "serious mode"
      if (selectedSessionMode === SessionMode.DEEP_WORK) {
        setTimeout(() => {
          void sessionStart();
        }, 120);
      }

      navigation.navigate('ActiveSession', {
        sessionId: session.id,
        selectedThemeId: selectedThemeOwned ? selectedThemeId : 'default',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected session start failure';
      setStartError(errorMessage);
      Sentry.captureException(error, {
        tags: {
          feature: 'session-start',
          phase: 'start-flow',
        },
      });
    } finally {
      setIsStarting(false);
      if (started) {
        try {
          await storage.removeItem(sessionDraftKey);
        } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'network-fallback', type: 'network' });}
      }
    }
  }, [createSession, draftGoal, navigation, params, selectedDurationSeconds, selectedPreset, selectedSessionMode, selectedThemeId, selectedThemeOwned, sessionDraftKey, startSession, storage, userId]);

  return {
    clearStartError: () => setStartError(null),
    handleStartSession,
    isStarting,
    startError,
  };
}
