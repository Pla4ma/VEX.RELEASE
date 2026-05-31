import {
  getOrCreateMemory,
} from './coach-memory';
import type { CoachStyle } from './personality-templates';
import { capture } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { createDebugger } from '@/utils/debug';
import {
  DAY1_EMPATHY_TEMPLATES,
  DAY2_GOAL_TEMPLATES,
  DAY3_MOMENTUM_TEMPLATES,
} from './post-failure-templates';
import {
  buildDay1Message,
  buildDay2Message,
  buildDay3Message,
  sendSupportMessage,
  scheduleFutureMessages,
  getUserPersonalityStyle,
} from './post-failure-helpers';

const debug = createDebugger('coach:post-failure');

export interface FailureContext {
  userId: string;
  streakDaysBeforeBreak: number;
  breakReason?:
    | 'MISSED_DAY'
    | 'SESSION_ABANDONED'
    | 'LOW_QUALITY'
    | 'USER_INITIATED';
  daysSinceBreak: number;
  previousComebackCount: number;
}

export interface SupportMessage {
  day: 1 | 2 | 3;
  content: string;
  actionItem: string;
  tone: 'EMPATHETIC' | 'CONSTRUCTIVE' | 'MOTIVATIONAL';
  shouldSend: boolean;
}

export interface SupportSequence {
  userId: string;
  startedAt: number;
  messages: SupportMessage[];
  currentDay: 1 | 2 | 3;
  completed: boolean;
}

export async function startPostFailureSupport(
  context: FailureContext,
): Promise<SupportSequence> {
  const { userId } = context;
  const memory = getOrCreateMemory(userId);
  const style = await getUserPersonalityStyle(userId);
  const sequence: SupportSequence = {
    userId,
    startedAt: Date.now(),
    currentDay: 1,
    completed: false,
    messages: [
      buildDay1Message(context, memory, style),
      buildDay2Message(context, memory, style),
      buildDay3Message(context, memory, style),
    ],
  };
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: 'POST_FAILURE',
    day: 1,
    streak_before_break: context.streakDaysBeforeBreak,
    personality_style: style,
  } as Record<string, unknown>);
  await sendSupportMessage(userId, sequence.messages[0]!);
  await scheduleFutureMessages(sequence);
  return sequence;
}

export async function checkAndSendScheduledMessages(
  userId: string,
): Promise<void> {
  debug.debug(
    `[Post-Failure Support] Checking scheduled messages for ${userId}`,
  );
}

export async function completePostFailureSupport(
  userId: string,
): Promise<void> {
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

export function previewPostFailureMessage(
  day: 1 | 2 | 3,
  style: CoachStyle,
  streakDaysBeforeBreak: number,
): string {
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
  return templates[0]!.replace(
    /\{\{streakDaysBeforeBreak\}\}/g,
    String(streakDaysBeforeBreak),
  );
}
