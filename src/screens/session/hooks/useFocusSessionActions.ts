/**
 * useFocusSessionActions — pause/resume/end/abandon + navigation glue.
 *
 * Returns stable handlers wired to the orchestrator via useSession, plus
 * navigation helpers. End → SessionComplete; Abandon → goBack.
 */
import { useCallback } from 'react';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { triggerHaptic } from '../../../utils/haptics';
import type { SessionStackParams } from '../../../navigation/types';
import { getSessionOrchestrator } from '../../../session/SessionOrchestrator';
import type { UseSessionReturn } from '../../../session/hooks/useSessionHelpers';
import type { SessionMode } from '../../../session/modes';

interface UseFocusSessionActionsInput {
  navigation: NativeStackNavigationProp<SessionStackParams>;
  sessionId: string;
  userId: string;
  isPaused: boolean;
  isActive: boolean;
  liveElapsed: number;
  livePercentage: number;
  totalDuration: number;
  sessionQuery: UseSessionReturn;
}

export function useFocusSessionActions(
  input: UseFocusSessionActionsInput,
): {
  handlePauseResume: () => Promise<void>;
  handleEnd: () => void;
  handleAbandon: () => void;
} {
  const {
    navigation,
    sessionId,
    userId,
    isPaused,
    liveElapsed,
    livePercentage,
    totalDuration,
    sessionQuery,
  } = input;

  const handlePauseResume = useCallback(async (): Promise<void> => {
    triggerHaptic('impactLight');
    try {
      if (isPaused) {
        await sessionQuery.resumeSession();
      } else {
        await sessionQuery.pauseSession();
      }
    } catch (err) {
       
      console.warn('pause/resume failed', err);
    }
  }, [isPaused, sessionQuery]);

  const handleEnd = useCallback((): void => {
    triggerHaptic('impactLight');
    Alert.alert(
      'End focus session?',
      'Your progress will be saved.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'End now',
          style: 'destructive',
          onPress: async () => {
            try {
              const orchestrator = getSessionOrchestrator();
              const finalSession = orchestrator.getSession();
              await sessionQuery.endSession();
              const placeholderSummary = {
                sessionId,
                userId,
                status: 'COMPLETED' as const,
                sessionMode: (finalSession?.config?.sessionMode ??
                  'LIGHT_FOCUS') as SessionMode,
                plannedDuration:
                  finalSession?.config?.duration ?? totalDuration,
                actualDuration: liveElapsed,
                effectiveDuration: liveElapsed,
                pausedDuration: 0,
                completionPercentage: livePercentage,
                focusQuality: livePercentage,
                focusPurityScore: 100,
                interruptions: 0,
                pauses: 0,
                pausedTime: 0,
                streakMaintained: true,
                modeBonus: 0,
                baseScore: livePercentage,
                timeBonus: 0,
                finalScore: livePercentage,
                createdAt: Date.now(),
                streakIncreased: false,
                streakDays: 0,
                xpEarned: 0,
                coinsEarned: 0,
                gemsEarned: 0,
                userLevel: 1,
                bonuses: [],
                damageTaken: 0,
                penaltiesApplied: [],
                vsAverage: 0,
                vsBest: 0,
              };
              navigation.navigate('SessionComplete', {
                sessionId,
                summary: placeholderSummary,
              });
            } catch (err) {
               
              console.warn('endSession failed', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [
    navigation,
    sessionId,
    userId,
    sessionQuery,
    liveElapsed,
    livePercentage,
    totalDuration,
  ]);

  const handleAbandon = useCallback((): void => {
    triggerHaptic('impactLight');
    Alert.alert(
      'Abandon this session?',
      "It won't count toward your streak.",
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionQuery.abandonSession();
            } catch (err) {
               
              console.warn('abandonSession failed', err);
            }
            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation, sessionQuery]);

  return { handlePauseResume, handleEnd, handleAbandon };
}
