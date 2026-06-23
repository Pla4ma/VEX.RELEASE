import { isSupabaseConfigured, supabase } from '../../../config/supabase';
import { readFunctionErrorMessage } from '../service/coach-screen-ai-errors';

const AI_COACH_FUNCTION = resolveCoachFunctionName(
  process.env.EXPO_PUBLIC_AI_COACH_FUNCTION,
);

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
): Promise<AiCoachFunctionResponse | null> {
  if (!isSupabaseConfigured() || !AI_COACH_FUNCTION.trim()) {
    return null;
  }

  const session = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke<AiCoachFunctionResponse>(
    AI_COACH_FUNCTION,
    {
      body: {
        context: buildCoachContext(question),
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

function buildCoachContext(question: string): Record<string, unknown> {
  return {
    category: chooseCoachCategory(question),
    currentLevel: 1,
    currentStreak: 0,
    hoursSinceLastSession: 0,
    userMessage: question,
  };
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
