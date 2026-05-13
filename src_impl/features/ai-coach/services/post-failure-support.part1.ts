import { getOrCreateMemory, getMemoryBasedSuggestions, type CoachMemory } from "./coach-memory";
import { generateMessage } from "../service/message-generator";
import { PERSONALITY_TEMPLATES, type CoachStyle } from "../service/personality-templates";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { createDebugger } from "@/utils/debug";


export async function startPostFailureSupport(context: FailureContext): Promise<SupportSequence> {
  const { userId } = context;

  // Get user's memory for personalization
  const memory = getOrCreateMemory(userId);

  // Get user's preferred personality style
  const style = await getUserPersonalityStyle(userId);

  // Build the 3-day support sequence
  const sequence: SupportSequence = {
    userId,
    startedAt: Date.now(),
    currentDay: 1,
    completed: false,
    messages: [buildDay1Message(context, memory, style), buildDay2Message(context, memory, style), buildDay3Message(context, memory, style)],
  };

  // Track analytics
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: 'POST_FAILURE',
    day: 1,
    streak_before_break: context.streakDaysBeforeBreak,
    personality_style: style,
  } as Record<string, unknown>);

  // Send Day 1 message immediately
  await sendSupportMessage(userId, sequence.messages[0]);

  // Schedule Day 2 and Day 3 messages
  await scheduleFutureMessages(sequence);

  return sequence;
}

export async function checkAndSendScheduledMessages(userId: string): Promise<void> {
  // In production, this would:
  // 1. Check if user is still in POST_FAILURE_SUPPORT state
  // 2. Check if previous day's action was completed
  // 3. Send appropriate message
  // 4. Update sequence state

  // For now, placeholder implementation
  debug.debug(`[Post-Failure Support] Checking scheduled messages for ${userId}`);
}

export async function completePostFailureSupport(userId: string): Promise<void> {
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: 'POST_FAILURE_COMPLETE',
  } as Record<string, unknown>);

  debug.debug(`[Post-Failure Support] Completed for ${userId}`);
}

export function getAllPostFailureTemplates(style: CoachStyle): {
  day1: string[];
  day2: string[];
  day3: string[];
} {
  return {
    day1: DAY1_EMPATHY_TEMPLATES[style],
    day2: DAY2_GOAL_TEMPLATES[style],
    day3: DAY3_MOMENTUM_TEMPLATES[style],
  };
}

export function previewPostFailureMessage(day: 1 | 2 | 3, style: CoachStyle, streakDaysBeforeBreak: number): string {
  let templates: string[];

  switch (day) {
    case 1:
      templates = DAY1_EMPATHY_TEMPLATES[style];
      break;
    case 2:
      templates = DAY2_GOAL_TEMPLATES[style];
      break;
    case 3:
      templates = DAY3_MOMENTUM_TEMPLATES[style];
      break;
  }

  const template = templates[0];
  return template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(streakDaysBeforeBreak));
}