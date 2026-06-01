import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { SessionStackParams } from '../../../navigation/types';
import { useSession } from '../../../session/hooks/useSession';
import { SessionMode } from '../../../session/modes';
import { SessionConfigSchema } from '../../../session/types';
import { sessionStart } from '../../../utils/haptics';
import type { PresetWithIcon } from '../utils/session-setup';

type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;

type UseFirstSessionStartParams = {
  navigation: SessionNavigationProp;
  userId: string;
};

type FirstSessionConfig = {
  mode: SessionMode;
  durationMinutes: number;
  goal?: string;
};

const FIRST_SESSION_PRESET: PresetWithIcon = {
  id: 'pomodoro',
  name: 'Pomodoro',
  duration: 25 * 60,
  category: 'standard',
  icon: 'timer',
  intervals: 1,
  breakDuration: 300,
  longBreakDuration: 900,
  longBreakInterval: 4,
  isDefault: true,
  tags: [],
  soundEnabled: true,
  vibrationEnabled: true,
  dndEnabled: false,
  strictMode: false,
  autoStartBreaks: false,
  autoStartNextInterval: false,
  createdAt: 0,
  updatedAt: 0,
};

export function useFirstSessionStart({
  navigation,
  userId,
}: UseFirstSessionStartParams) {
  const { createSession, startSession } = useSession(userId);
  const [isStarting, setIsStarting] = useState(false);

  const handleFirstSessionStart = useCallback(
    async (config: FirstSessionConfig) => {
      setIsStarting(true);

      try {
        const sessionTags: string[] = ['first-session', 'onboarding'];

        if (config.goal) {
          sessionTags.push(`goal:${config.goal}`);
        }
        if (config.mode === SessionMode.STUDY) {
          sessionTags.push('study-session');
        }

        const sessionConfig = SessionConfigSchema.parse({
          duration: config.durationMinutes * 60,
          breakDuration: FIRST_SESSION_PRESET.breakDuration,
          longBreakDuration: FIRST_SESSION_PRESET.longBreakDuration,
          intervals: FIRST_SESSION_PRESET.intervals,
          longBreakInterval: FIRST_SESSION_PRESET.longBreakInterval,
          category: 'standard',
          tags: sessionTags,
          soundEnabled: FIRST_SESSION_PRESET.soundEnabled,
          vibrationEnabled: FIRST_SESSION_PRESET.vibrationEnabled,
          dndEnabled: FIRST_SESSION_PRESET.dndEnabled,
          strictMode: false,
          sessionMode: config.mode,
          autoStartBreaks: FIRST_SESSION_PRESET.autoStartBreaks,
          autoStartNextInterval: FIRST_SESSION_PRESET.autoStartNextInterval,
          goal: config.goal ?? 'First session',
          notes:
            config.mode === SessionMode.STUDY && config.goal
              ? JSON.stringify({ source: 'direct', studyTarget: config.goal })
              : undefined,
        });

        Sentry.addBreadcrumb({
          category: 'session-start',
          message: 'Creating first session from setup flow',
          level: 'info',
        });

        const session = await createSession(sessionConfig);
        await startSession(0);

        await sessionStart();

        if (config.mode === SessionMode.DEEP_WORK) {
          setTimeout(() => {
            void sessionStart();
          }, 120);
        }

        navigation.navigate('ActiveSession', {
          sessionId: session.id,
          selectedThemeId: 'default',
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unexpected session start failure';
        Sentry.captureException(error, {
          tags: {
            feature: 'session-start',
            phase: 'first-session-start-flow',
          },
        });
        throw new Error(errorMessage);
      } finally {
        setIsStarting(false);
      }
    },
    [createSession, navigation, startSession],
  );

  return {
    handleFirstSessionStart,
    isStarting,
  };
}
