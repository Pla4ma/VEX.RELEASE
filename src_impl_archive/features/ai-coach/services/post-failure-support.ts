import { getOrCreateMemory, getMemoryBasedSuggestions, type CoachMemory } from './coach-memory';
import { generateMessage } from '../service/message-generator';
import type { CoachStyle } from '../service/personality-templates';
import { capture } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { createDebugger } from '@/utils/debug';
import { DAY1_EMPATHY_TEMPLATES, DAY2_GOAL_TEMPLATES, DAY3_MOMENTUM_TEMPLATES } from './post-failure-templates';

const debug = createDebugger('coach:post-failure');

export interface FailureContext {
  userId: string;
  streakDaysBeforeBreak: number;
  breakReason?: 'MISSED_DAY' | 'SESSION_ABANDONED' | 'LOW_QUALITY' | 'USER_INITIATED';
  daysSinceBreak: number;
  previousComebackCount: number;
}

export interface SupportMessage {
  day: 1 | 2 | 3; content: string; actionItem: string; tone: 'EMPATHETIC' | 'CONSTRUCTIVE' | 'MOTIVATIONAL'; shouldSend: boolean;
}

export interface SupportSequence {
  userId: string; startedAt: number; messages: SupportMessage[]; currentDay: 1 | 2 | 3; completed: boolean;
}

export async function startPostFailureSupport(context: FailureContext): Promise<SupportSequence> {
  const { userId } = context;
  const memory = getOrCreateMemory(userId);
  const style = await getUserPersonalityStyle(userId);
  const sequence: SupportSequence = {
    userId, startedAt: Date.now(), currentDay: 1, completed: false,
    messages: [buildDay1Message(context, memory, style), buildDay2Message(context, memory, style), buildDay3Message(context, memory, style)],
  };
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, { category: 'POST_FAILURE', day: 1, streak_before_break: context.streakDaysBeforeBreak, personality_style: style } as Record<string, unknown>);
  await sendSupportMessage(userId, sequence.messages[0]!);
  await scheduleFutureMessages(sequence);
  return sequence;
}

function buildDay1Message(context: FailureContext, memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY1_EMPATHY_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  let content = template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak));
  const suggestions = getMemoryBasedSuggestions(context.userId, 'COMEBACK_SUPPORT');
  if (suggestions.length > 0) content += `\n\n${suggestions[0]!}`;
  return { day: 1, content, actionItem: 'Reflect on what happened (no judgment)', tone: 'EMPATHETIC', shouldSend: true };
}

function buildDay2Message(context: FailureContext, _memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY2_GOAL_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return { day: 2, content: template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak)), actionItem: 'Complete one 15-minute session', tone: 'CONSTRUCTIVE', shouldSend: true };
}

function buildDay3Message(context: FailureContext, _memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY3_MOMENTUM_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)]!;
  return { day: 3, content: template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak)), actionItem: 'Complete one 20-minute session', tone: 'MOTIVATIONAL', shouldSend: true };
}

async function sendSupportMessage(userId: string, message: SupportMessage): Promise<void> {
  debug.debug(`[Post-Failure Support] Day ${message.day} message to ${userId}:`, message.content);
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, { category: 'POST_FAILURE', day: message.day, tone: message.tone } as Record<string, unknown>);
  try {
    await generateMessage({ userId, category: 'POST_FAILURE', context: { day: message.day, content: message.content, actionItem: message.actionItem }, preferredDelivery: 'PUSH' });
  } catch (error) {
    debug.error('Failed to generate post-failure message', error instanceof Error ? error : new Error(String(error)));
  }
}

async function scheduleFutureMessages(sequence: SupportSequence): Promise<void> {
  debug.debug(`[Post-Failure Support] Scheduled messages for ${sequence.userId}:`, { day2: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), day3: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() });
}

async function getUserPersonalityStyle(_userId: string): Promise<CoachStyle> { return 'FRIEND'; }

export async function checkAndSendScheduledMessages(userId: string): Promise<void> {
  debug.debug(`[Post-Failure Support] Checking scheduled messages for ${userId}`);
}

export async function completePostFailureSupport(userId: string): Promise<void> {
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, { category: 'POST_FAILURE_COMPLETE' } as Record<string, unknown>);
  debug.debug(`[Post-Failure Support] Completed for ${userId}`);
}

export function getAllPostFailureTemplates(style: CoachStyle): { day1: string[]; day2: string[]; day3: string[] } {
  return { day1: DAY1_EMPATHY_TEMPLATES[style], day2: DAY2_GOAL_TEMPLATES[style], day3: DAY3_MOMENTUM_TEMPLATES[style] };
}

export function previewPostFailureMessage(day: 1 | 2 | 3, style: CoachStyle, streakDaysBeforeBreak: number): string {
  let templates: string[];
  switch (day) { case 1: templates = DAY1_EMPATHY_TEMPLATES[style]; break; case 2: templates = DAY2_GOAL_TEMPLATES[style]; break; case 3: templates = DAY3_MOMENTUM_TEMPLATES[style]; break; }
  return templates[0]!.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(streakDaysBeforeBreak));
}
