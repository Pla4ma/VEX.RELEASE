import * as Sentry from '@sentry/react-native';
import { isSupabaseConfigured, supabase } from '../../../config/supabase';
import { fetchProgression } from '../../progression/repository';
import { fetchStreak } from '../../streaks/streak-queries';
import { readFunctionErrorMessage } from '../service/coach-screen-ai-errors';
import type { CoachConversationTurn } from '../schemas';
import { fetchBehaviorProfile } from './behavior';
import { fetchCoachState } from './state';

const AI_COACH_FUNCTION = resolveCoachFunctionName(
  process.env.EXPO_PUBLIC_AI_COACH_FUNCTION,
);

export class CoachSessionUnavailableError extends Error {
  constructor() {
    super('AI Coach is using local development mode because no Supabase session is available.');
    this.name = 'CoachSessionUnavailableError';
  }
}

export interface AiCoachFunctionResponse {
  success?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
  };
  content?: unknown;
  structuredData?: {
    message?: unknown;
    action?: unknown;
    actionLabel?: unknown;
  };
  message?: unknown;
  action?: { type?: unknown; duration?: unknown; difficulty?: unknown };
}

export async function invokeAiCoachFunction(
  question: string,
  userId: string,
  recentConversation: CoachConversationTurn[] = [],
): Promise<AiCoachFunctionResponse | null> {
  if (!isSupabaseConfigured() || !AI_COACH_FUNCTION.trim()) {
    return null;
  }

  const session = await supabase.auth.getSession();
  if (!session.data.session && __DEV__ && !process.env.JEST_WORKER_ID) {
    throw new CoachSessionUnavailableError();
  }
  const { data, error } = await supabase.functions.invoke<AiCoachFunctionResponse>(
    AI_COACH_FUNCTION,
    {
      body: {
        context: await buildCoachContext(question, userId, recentConversation),
        requestType: 'GENERATE_COACH_MESSAGE',
        userId,
      },
    },
  );

  if (error) {
    throw new Error(
      await readFunctionErrorMessage(error, {
        functionName: AI_COACH_FUNCTION,
        hasSession: Boolean(session.data.session),
        userId,
      }),
    );
  }

  return data;
}

async function buildCoachContext(
  question: string,
  userId: string,
  recentConversation: CoachConversationTurn[],
): Promise<Record<string, unknown>> {
  const [coachStateResult, behaviorResult, streakResult, progressionResult] =
    await Promise.allSettled([
      fetchCoachState(userId),
      fetchBehaviorProfile(userId),
      fetchStreak(userId),
      fetchProgression(userId),
    ]);

  const coachState = getSettledValue(coachStateResult);
  const behaviorProfile = getSettledValue(behaviorResult);
  const streak = getSettledValue(streakResult);
  const progression = getSettledValue(progressionResult);

  captureContextReadFailures([
    coachStateResult,
    behaviorResult,
    streakResult,
    progressionResult,
  ]);

  const lastSessionAt = streak?.lastQualifyingSessionAt ?? null;
  const hoursSinceLastSession = lastSessionAt
    ? Math.max(0, (Date.now() - lastSessionAt) / (60 * 60 * 1000))
    : null;

  return {
    category: chooseCoachCategory(question),
    ...(progression ? { currentLevel: progression.level } : {}),
    ...(streak
      ? { currentStreak: streak.currentDays, longestStreak: streak.longestDays }
      : {}),
    ...(hoursSinceLastSession !== null ? { hoursSinceLastSession } : {}),
    coachState: coachState?.currentState ?? null,
    behaviorProfile: behaviorProfile
      ? {
          confidenceLevel: behaviorProfile.confidenceLevel,
          coldStart: behaviorProfile.coldStart,
          dataPoints: behaviorProfile.dataPoints,
          signals: behaviorProfile.signals.slice(0, 12),
        }
      : null,
    recentConversation: recentConversation.slice(-8),
    userMessage: question,
  };
}

function getSettledValue<T>(
  result: PromiseSettledResult<T>,
): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

function captureContextReadFailures(
  results: PromiseSettledResult<unknown>[],
): void {
  results.forEach((result) => {
    if (result.status === 'rejected') {
      Sentry.captureException(result.reason, {
        tags: { feature: 'ai-coach', operation: 'build-coach-context' },
      });
    }
  });
}

function chooseCoachCategory(question: string): string {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('break')) {
    return 'BREAK_SUGGESTION';
  }
  if (lowerQuestion.includes('streak')) {
    return 'STREAK_RISK';
  }
  if (lowerQuestion.includes('progress') || lowerQuestion.includes('level')) {
    return 'PROGRESS_REMINDER';
  }
  return 'MOTIVATION_BOOST';
}

function resolveCoachFunctionName(value: string | undefined): string {
  if (!value || value.trim().length === 0 || value === 'ai-router') {
    return 'ai-coach';
  }
  return value;
}
