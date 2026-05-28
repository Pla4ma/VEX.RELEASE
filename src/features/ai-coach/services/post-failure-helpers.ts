import {
  getMemoryBasedSuggestions,
  type CoachMemory,
} from "./coach-memory";
import { generateMessage } from "./message-generator";
import type { CoachStyle } from "./personality-templates";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { createDebugger } from "@/utils/debug";
import {
  DAY1_EMPATHY_TEMPLATES,
  DAY2_GOAL_TEMPLATES,
  DAY3_MOMENTUM_TEMPLATES,
} from "./post-failure-templates";
import type {
  FailureContext,
  SupportMessage,
  SupportSequence,
} from "./post-failure-support";

const debug = createDebugger("coach:post-failure-helpers");

export function buildDay1Message(
  context: FailureContext,
  memory: CoachMemory,
  style: CoachStyle,
): SupportMessage {
  const templates = DAY1_EMPATHY_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  let content = template.replace(
    /\{\{streakDaysBeforeBreak\}\}/g,
    String(context.streakDaysBeforeBreak),
  );
  const suggestions = getMemoryBasedSuggestions(
    context.userId,
    "COMEBACK_SUPPORT",
  );
  if (suggestions.length > 0) content += `\n\n${suggestions[0]!}`;
  return {
    day: 1,
    content,
    actionItem: "Reflect on what happened (no judgment)",
    tone: "EMPATHETIC",
    shouldSend: true,
  };
}

export function buildDay2Message(
  context: FailureContext,
  _memory: CoachMemory,
  style: CoachStyle,
): SupportMessage {
  const templates = DAY2_GOAL_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return {
    day: 2,
    content: template.replace(
      /\{\{streakDaysBeforeBreak\}\}/g,
      String(context.streakDaysBeforeBreak),
    ),
    actionItem: "Complete one 15-minute session",
    tone: "CONSTRUCTIVE",
    shouldSend: true,
  };
}

export function buildDay3Message(
  context: FailureContext,
  _memory: CoachMemory,
  style: CoachStyle,
): SupportMessage {
  const templates = DAY3_MOMENTUM_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return {
    day: 3,
    content: template.replace(
      /\{\{streakDaysBeforeBreak\}\}/g,
      String(context.streakDaysBeforeBreak),
    ),
    actionItem: "Complete one 20-minute session",
    tone: "MOTIVATIONAL",
    shouldSend: true,
  };
}

export async function sendSupportMessage(
  userId: string,
  message: SupportMessage,
): Promise<void> {
  debug.debug(
    `[Post-Failure Support] Day ${message.day} message to ${userId}:`,
    message.content,
  );
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: "POST_FAILURE",
    day: message.day,
    tone: message.tone,
  } as Record<string, unknown>);
  try {
    await generateMessage({
      userId,
      category: "POST_FAILURE",
      context: {
        day: message.day,
        content: message.content,
        actionItem: message.actionItem,
      },
      preferredDelivery: "PUSH",
    });
  } catch (error) {
    debug.error(
      "Failed to generate post-failure message",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export async function scheduleFutureMessages(
  sequence: SupportSequence,
): Promise<void> {
  debug.debug(
    `[Post-Failure Support] Scheduled messages for ${sequence.userId}:`,
    {
      day2: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      day3: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    },
  );
}

export async function getUserPersonalityStyle(
  _userId: string,
): Promise<CoachStyle> {
  return "FRIEND";
}
