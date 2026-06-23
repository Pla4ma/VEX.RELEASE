import { ACTION_LABELS } from '../../coach-presence/copy';
import { CoachActionIntentSchema } from '../../coach-presence/schemas';
import { resolveCoachActionIntent } from '../../coach-presence/service';
import { getAvailabilityFor } from '../../liveops-config';
import {
  invokeAiCoachFunction,
  type AiCoachFunctionResponse,
} from '../repository/coach-ai-function-repository';
import type { CoachQuestionResponse } from './coach-screen-service';

export async function askAiCoachFunction(
  question: string,
  userId?: string,
): Promise<CoachQuestionResponse | null> {
  if (!userId) {
    throw new Error('Coach AI needs a signed-in user before it can respond.');
  }
  const data = await invokeAiCoachFunction(question, userId);
  if (!data) {
    return null;
  }
  const message = readAiMessage(data);
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
