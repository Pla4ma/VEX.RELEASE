import { ACTION_LABELS } from '../../coach-presence/copy';
import { CoachActionIntentSchema } from '../../coach-presence/schemas';
import { resolveCoachActionIntent } from '../../coach-presence/service';
import { getAvailabilityFor } from '../../liveops-config';
import { isSupabaseConfigured, supabase } from '../../../config/supabase';
import { readFunctionErrorMessage } from './coach-screen-ai-errors';
import type { CoachQuestionResponse } from './coach-screen-service';

const AI_COACH_FUNCTION = resolveCoachFunctionName(
  process.env.EXPO_PUBLIC_AI_COACH_FUNCTION,
);

interface AiCoachFunctionResponse {
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

export async function askAiCoachFunction(
  question: string,
  userId?: string,
): Promise<CoachQuestionResponse | null> {
  if (!isSupabaseConfigured() || !AI_COACH_FUNCTION.trim()) {
    return null;
  }
  if (!userId) {
    throw new Error('Coach AI needs a signed-in user before it can respond.');
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
  const message = readAiMessage(data);
  if (error) {
    throw new Error(
      await readFunctionErrorMessage(error, {
        functionName: AI_COACH_FUNCTION,
        hasSession: Boolean(session.data.session),
        userId,
      }),
    );
  }
  if (data?.success === false) {
    throw new Error(readAiPayloadError(data));
  }
  if (!message) {
    throw new Error('Coach AI returned no message. payload=' + JSON.stringify(data));
  }

  const structuredData = data?.structuredData;
  const action = normalizeCoachAction(structuredData?.action ?? data?.action);
  return {
    actionData: action,
    actionLabel:
      typeof structuredData?.actionLabel === 'string'
        ? structuredData.actionLabel
        : action ? ACTION_LABELS[action.type] : undefined,
    hasAction: Boolean(action),
    message,
  };
}

function readAiMessage(data: AiCoachFunctionResponse | null): string | null {
  if (typeof data?.structuredData?.message === 'string') {
    return data.structuredData.message;
  }
  if (typeof data?.content === 'string') {
    return data.content;
  }
  return typeof data?.message === 'string' ? data.message : null;
}

function readAiPayloadError(data: AiCoachFunctionResponse): string {
  const code = typeof data.error?.code === 'string' ? data.error.code : 'AI_ERROR';
  const message =
    typeof data.error?.message === 'string'
      ? data.error.message
      : 'Coach AI returned an error payload.';
  return code + ': ' + message;
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

function normalizeCoachAction(
  action: AiCoachFunctionResponse['action'] | unknown,
): CoachQuestionResponse['actionData'] | undefined {
  const rawIntent = readActionIntent(action);
  if (!rawIntent) {
    return undefined;
  }
  const parsedIntent = CoachActionIntentSchema.safeParse(
    mapAiActionIntent(rawIntent),
  );
  if (!parsedIntent.success) {
    return undefined;
  }

  return {
    difficulty: readActionString(action, 'difficulty'),
    duration: readActionNumber(action, 'duration'),
    type: resolveCoachActionIntent({
      featureAvailability: {
        focus: getAvailabilityFor('focus_session'),
        progress: getAvailabilityFor('progress_view'),
        study: getAvailabilityFor('content_study'),
      },
      requestedIntent: parsedIntent.data,
    }),
  };
}

function readActionIntent(action: unknown): string | undefined {
  if (typeof action === 'string') {
    return action;
  }
  return readActionString(action, 'type');
}

function readActionString(action: unknown, key: string): string | undefined {
  if (!isRecord(action) || !(key in action)) {
    return undefined;
  }
  const value = action[key];
  return typeof value === 'string' ? value : undefined;
}

function readActionNumber(action: unknown, key: string): number | undefined {
  if (!isRecord(action) || !(key in action)) {
    return undefined;
  }
  const value = action[key];
  return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapAiActionIntent(intent: string): string {
  switch (intent) {
    case 'VIEW_PROGRESS':
      return 'REVIEW_PROGRESS';
    case 'OPEN_CONTENT_STUDY':
      return 'START_STUDY_SESSION';
    case 'NONE':
      return '';
    default:
      return intent;
  }
}

function resolveCoachFunctionName(value: string | undefined): string {
  if (!value || value.trim().length === 0 || value === 'ai-router') {
    return 'ai-coach';
  }
  return value;
}
