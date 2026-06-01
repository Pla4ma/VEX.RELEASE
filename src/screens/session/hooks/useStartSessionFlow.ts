import { captureSilentFailure } from '../../../utils/silent-failure';
import { useCallback, useMemo, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { getSprintChainService } from '../../../features/session/SprintChainService';
import { startStreakRestoreQuest } from '../../../features/streaks/restore-quest';
import { getMMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';
import { SessionMode } from '../../../session/modes';
import { useSession } from '../../../session/hooks/useSession';
import { SessionConfigSchema } from '../../../session/types';
import { sessionStart } from '../../../utils/haptics';
import {
  createContract,
  skipContract,
} from '../../../features/focus-contract/service';
import type {
  UseStartSessionFlowParams,
} from './sessionFlowTypes';
import { buildSessionContext } from './buildSessionContext';

export function useStartSessionFlow({
  draftGoal,
  focusContractText,
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
      const { sessionTags, notesPayload } = buildSessionContext(
        params,
        selectedPreset,
        selectedSessionMode,
        draftGoal,
        selectedThemeId,
        selectedThemeOwned,
      );

      if (params?.comebackQuest) {
        await startStreakRestoreQuest(
          userId,
          params.comebackQuest.streakBefore,
        );
      }

      const sprintChainState =
        selectedSessionMode === SessionMode.SPRINT
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
        notes:
          Object.keys(notesPayload).length > 0
            ? JSON.stringify(notesPayload)
            : undefined,
      });

      Sentry.addBreadcrumb({
        category: 'session-start',
        message: 'Creating session from setup flow',
        level: 'info',
      });
      const session = await createSession(config);
      const contractTask = focusContractText?.trim() ?? '';
      try {
        if (contractTask.length >= 3) {
          await createContract(
            { sessionId: session.id, taskDescription: contractTask },
            userId,
          );
        } else {
          await skipContract(session.id, userId);
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            feature: 'focus-contract',
            operation: 'session-start-create',
          },
        });
      }
      await startSession(0);

      started = true;

      await sessionStart();

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
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unexpected session start failure';
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
        } catch (error) {
          captureSilentFailure(error, {
            feature: 'screens',
            operation: 'network-fallback',
            type: 'network',
          });
        }
      }
    }
  }, [
    createSession,
    draftGoal,
    focusContractText,
    navigation,
    params,
    selectedDurationSeconds,
    selectedPreset,
    selectedSessionMode,
    selectedThemeId,
    selectedThemeOwned,
    sessionDraftKey,
    startSession,
    storage,
    userId,
  ]);

  return {
    clearStartError: () => setStartError(null),
    handleStartSession,
    isStarting,
    startError,
  };
}
