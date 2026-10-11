import type { AIRequest } from './schemas.ts';

const MAX_USER_MESSAGE_LENGTH = 500;

export interface CoachPrompt {
  system: string;
  user: string;
  maxOutputTokens: number;
}

export function sanitizeUserInput(
  text: string,
  maxLength: number = MAX_USER_MESSAGE_LENGTH,
): string {
  return text
    .normalize('NFKC')
    .replace(/[^\x20-\x7E\u00A0-\u024F\u0400-\u04FF\u4E00-\u9FFF\uAC00-\uD7AF]/g, '')
    .replace(/system\s*instruction/gi, '[filtered]')
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '[filtered]')
    .replace(/developer\s*message/gi, '[filtered]')
    .replace(/\b(DAN|jailbreak|ignore|override|bypass)\b/gi, '[filtered]')
    .slice(0, maxLength);
}

export function buildPrompt(request: AIRequest): CoachPrompt {
  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
    const userMessage = typeof request.context.userMessage === 'string'
      ? sanitizeUserInput(request.context.userMessage)
      : '';
    return {
      system: 'You are VEX, a personalized focus coach inside a productivity app. Respond to the person\'s actual message with specific, grounded guidance based on the supplied context. VEX is not VEX Robotics: never mention sensors, motors, robots, competitions, providers, or model names unless the person explicitly asks about those external topics. Never claim a feeling or pattern that is not supported by the context. Do not use slogans, motivational filler, fake familiarity, or phrases like "your rhythm is warm." If the context is incomplete, say what is missing and ask one useful follow-up. Answer in one to three natural sentences. No quotes, headings, or meta-commentary.',
      user: JSON.stringify({
        message: userMessage,
        recentConversation: readRecentConversation(request.context.recentConversation),
        context: {
          category: request.context.category,
          currentLevel: request.context.currentLevel ?? null,
          currentStreak: request.context.currentStreak ?? null,
          hoursSinceLastSession: request.context.hoursSinceLastSession ?? null,
          recentSessionOutcomes: request.context.recentSessionOutcomes ?? [],
          personaStyle: request.context.personaStyle ?? null,
        },
      }),
      maxOutputTokens: 180,
    };
  }
  if (request.requestType === 'GENERATE_AGENT_DECISION') {
    const sanitizedContext = sanitizeUserInput(JSON.stringify({
      context: request.context,
      requiredPolicy: { requiresUserConfirmation: true, canAutoExecute: false },
    }));
    return {
      system: 'You are VEX Invisible Agent. Return exactly one JSON object with only these fields: type, message, reasonCode, confidence. type must be START_SESSION, RESCUE_STREAK, CONTINUE_STUDY_PLAN, REVIEW_PROGRESS, or NO_ACTION. reasonCode must be STREAK_AT_RISK, LOW_ENERGY_PATTERN, ACTIVE_STUDY_PLAN, RECENT_MISSED_SESSION, or ENOUGH_DONE_TODAY. Keep message under 220 characters and confidence from 0 to 1. Choose NO_ACTION with ENOUGH_DONE_TODAY only when completedToday is true; never claim completion otherwise. Choose RESCUE_STREAK only for an active streak with hoursUntilStreakDeadline at most 4. Choose CONTINUE_STUDY_PLAN only when activeStudyPackId is present and isOnline is true. Never guilt the user or auto-execute. Do not include userId, decisionId, expiresAt, evidence, actionPayload, or policy; the server binds those fields to authenticated context.',
      user: sanitizedContext,
      maxOutputTokens: 260,
    };
  }
  return {
    system: 'Return a short plain-text coaching response.',
    user: JSON.stringify(request.context),
    maxOutputTokens: 150,
  };
}

function readRecentConversation(
  value: unknown,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(value)) {return [];}
  return value
    .filter((turn): turn is Record<string, unknown> => isRecord(turn))
    .map((turn) => ({
      role: turn.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: typeof turn.content === 'string' ? sanitizeUserInput(turn.content, 500) : '',
    }))
    .filter((turn) => turn.content.length > 0)
    .slice(-8);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
