/**
 * Post-Failure Support Service
 *
 * Phase 9.5 — Emotional intelligence for streak breaks and setbacks
 * 3-message sequence over 3 days: Day 1 (empathy), Day 2 (small goal), Day 3 (momentum)
 *
 * Core principles:
 * - No guilt. No "you let yourself down."
 * - Only: "What happened? Let's figure out how to prevent it next time."
 * - References past successes from coach memory
 * - Provides small actionable next steps
 */

import { getOrCreateMemory, getMemoryBasedSuggestions, type CoachMemory } from "./coach-memory";
import { generateMessage } from "../service/message-generator";
import { PERSONALITY_TEMPLATES, type CoachStyle } from "../service/personality-templates";
import { capture } from "@/shared/analytics";
import { CoachEvents } from "@/shared/analytics/analytics-events";
import { createDebugger } from "@/utils/debug";

const debug = createDebugger("coach:post-failure");

// ============================================================================
// Types
// ============================================================================

export interface FailureContext {
  userId: string;
  streakDaysBeforeBreak: number;
  breakReason?: "MISSED_DAY" | "SESSION_ABANDONED" | "LOW_QUALITY" | "USER_INITIATED";
  daysSinceBreak: number;
  previousComebackCount: number;
}

export interface SupportMessage {
  day: 1 | 2 | 3;
  content: string;
  actionItem: string;
  tone: "EMPATHETIC" | "CONSTRUCTIVE" | "MOTIVATIONAL";
  shouldSend: boolean; // Whether to send based on user's state
}

export interface SupportSequence {
  userId: string;
  startedAt: number;
  messages: SupportMessage[];
  currentDay: 1 | 2 | 3;
  completed: boolean;
}

// ============================================================================
// Day 1: Empathy Messages
// ============================================================================

const DAY1_EMPATHY_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: ["LISTEN UP. The streak broke. I won't sugarcoat it — but I also won't let you stay down. Tell me: what happened? We'll fix it.", "SETBACKS HAPPEN. Even to the best. Your {{streakDaysBeforeBreak}}-day streak proves you have what it takes. Now we REBUILD."],
  FRIEND: ["Hey, I noticed your streak ended. That really sucks — I know you were working hard on it. Want to talk about what happened? 💙", "{{streakDaysBeforeBreak}} days was amazing, and I know you can do it again. No judgment here — just want to help you get back on track. 🤗"],
  MENTOR: ["The path of discipline includes moments of interruption. Your {{streakDaysBeforeBreak}} days demonstrated remarkable commitment. Let us understand what occurred and prepare for what follows.", "Streaks, like all things, are impermanent. What matters is the wisdom gained. What would you identify as the primary challenge?"],
  CHEERLEADER: ["Oh no! Your streak ended? I'm so sorry! 😢 But you know what? {{streakDaysBeforeBreak}} days was INCREDIBLE and you can totally do it again!", "Don't you dare feel bad! You did something amazing for {{streakDaysBeforeBreak}} days! Let's figure out what got in the way! 🌟"],
  RIVAL: ["Well, that happened. {{streakDaysBeforeBreak}} days down. Question is: you going to let that define you, or are you coming back stronger?", "I've seen you at {{streakDaysBeforeBreak}} days. That person didn't disappear. So what's the plan?"],
  MINDFUL: ["Breathe. The streak has ended, and with it, certain expectations. Let us sit with this moment. What arose that interrupted your practice?", "Each end is also a beginning. Your {{streakDaysBeforeBreak}} days were beautiful in their consistency. Now, we turn the page gently."],
};

// ============================================================================
// Day 2: Small Goal Messages
// ============================================================================

const DAY2_GOAL_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: ["DAY 2 OF YOUR COMEBACK. Here's your MISSION: ONE 15-minute session today. That's it. Not 30. Not 25. FIFTEEN. Execute.", "Small wins rebuild confidence. Your target: 15 minutes. Once that's done, you're back in the fight. MOVE."],
  FRIEND: ["Day 2! Let's keep it super simple — just one 15-minute session today? No pressure for anything more. You've got this! 💪", "Hey, how about we just focus on today? One little 15-minute session. That's all I'm asking! Easy peasy! 🌟"],
  MENTOR: ["Day two invites a gentle reengagement. I propose a single 15-minute session — modest, achievable, and sufficient to reestablish rhythm.", "The mountain is climbed one step at a time. Today's step: 15 minutes of focused attention. Nothing more is required."],
  CHEERLEADER: ["Day 2 of your comeback! 🎉 Let's make it TINY and EASY — just 15 minutes! You can totally do that! I believe in you!", "Fifteen minutes! That's like... nothing! You got this! Start small, end BIG! 🚀"],
  RIVAL: ["Day 2. Here's the deal: 15 minutes. That's your test. Pass it, and we build. Fail it... well, that's on you.", "Fifteen minutes. You can do that in your sleep. Question is: will you?"],
  MINDFUL: ["Day two. A 15-minute session awaits — not as obligation, but as gift to yourself. Begin, and let the rest unfold naturally.", "Fifteen minutes. Breathe in, begin. Breathe out, complete. No more, no less."],
};

// ============================================================================
// Day 3: Momentum Messages
// ============================================================================

const DAY3_MOMENTUM_TEMPLATES: Record<CoachStyle, string[]> = {
  DRILL_SERGEANT: ["DAY 3. You've got one session under your belt. Now we BUILD MOMENTUM. Today: 20 minutes. You're not broken — you're REBUILDING.", "Two sessions in three days. That's your new foundation. Today we add another. TWENTY MINUTES. Execute."],
  FRIEND: ["Day 3! You're doing amazing! 🌟 How about we bump it up just a tiny bit to 20 minutes? You've proven you can do this!", "Two sessions down, and you're already building momentum! Let's do 20 minutes today? I'm so proud of you! 💙"],
  MENTOR: ["Day three. Momentum is gathering like water forming a stream. Today: 20 minutes. Observe how the practice deepens with continuity.", "You have reestablished your practice. Now we extend it gently to 20 minutes. The habit is returning."],
  CHEERLEADER: ["DAY 3!! 🎉🎉 You're ON FIRE! Let's do 20 minutes today and keep this amazing momentum going! You are SO back!", "Momentum is YOURS! 20 minutes today? Easy for someone who just came back from a break! YOU'VE GOT THIS! 🔥"],
  RIVAL: ["Day 3. You've started the engine. Now give it some gas. 20 minutes. Don't let me down.", "You're back. Now prove you're staying. 20 minutes today."],
  MINDFUL: ["Day three. The momentum of presence is building. Today: 20 minutes. Flow with it, neither grasping nor resisting.", "Twenty minutes today. The practice returns to you as you return to it. Natural, cyclical, complete."],
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Start post-failure support sequence for a user
 * Called when streak breaks or session fails
 */
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
    category: "POST_FAILURE",
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

/**
 * Build Day 1 (Empathy) message
 */
function buildDay1Message(context: FailureContext, memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY1_EMPATHY_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Substitute variables
  let content = template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak));

  // Add memory-based personalization
  const memorySuggestions = getMemoryBasedSuggestions(context.userId, "COMEBACK_SUPPORT");
  if (memorySuggestions.length > 0) {
    content += `\n\n${memorySuggestions[0]}`;
  }

  return {
    day: 1,
    content,
    actionItem: "Reflect on what happened (no judgment)",
    tone: "EMPATHETIC",
    shouldSend: true,
  };
}

/**
 * Build Day 2 (Small Goal) message
 */
function buildDay2Message(context: FailureContext, _memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY2_GOAL_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Substitute variables
  const content = template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak));

  return {
    day: 2,
    content,
    actionItem: "Complete one 15-minute session",
    tone: "CONSTRUCTIVE",
    shouldSend: true, // Will be verified when time comes
  };
}

/**
 * Build Day 3 (Momentum) message
 */
function buildDay3Message(context: FailureContext, _memory: CoachMemory, style: CoachStyle): SupportMessage {
  const templates = DAY3_MOMENTUM_TEMPLATES[style];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Substitute variables
  const content = template.replace(/\{\{streakDaysBeforeBreak\}\}/g, String(context.streakDaysBeforeBreak));

  return {
    day: 3,
    content,
    actionItem: "Complete one 20-minute session",
    tone: "MOTIVATIONAL",
    shouldSend: true, // Will be verified when time comes
  };
}

/**
 * Send a support message to the user
 */
async function sendSupportMessage(userId: string, message: SupportMessage): Promise<void> {
  // In production, this would queue the message via notification service
  // For now, log it
  debug.debug(`[Post-Failure Support] Day ${message.day} message to ${userId}:`, message.content);

  // Track analytics
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: "POST_FAILURE",
    day: message.day,
    tone: message.tone,
  } as Record<string, unknown>);

  // Generate and queue the actual coach message
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
    debug.error("Failed to generate post-failure message", error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Schedule Day 2 and Day 3 messages
 */
async function scheduleFutureMessages(sequence: SupportSequence): Promise<void> {
  // In production, this would use a job scheduler or notification service
  // For now, we'll store the sequence in memory/storage

  const scheduleKey = `post_failure_schedule_${sequence.userId}`;

  // Store the sequence for later retrieval
  // The actual scheduling would be handled by a background job
  debug.debug(`[Post-Failure Support] Scheduled messages for ${sequence.userId}:`, {
    day2: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    day3: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });
}

/**
 * Get user's preferred personality style
 * In production, this would fetch from user preferences
 */
async function getUserPersonalityStyle(userId: string): Promise<CoachStyle> {
  // Default to FRIEND for post-failure support (most supportive)
  // Could be customized based on user preference
  return "FRIEND";
}

// ============================================================================
// Check and Send Scheduled Messages
// ============================================================================

/**
 * Check if any scheduled post-failure messages should be sent
 * Called periodically by a background job
 */
export async function checkAndSendScheduledMessages(userId: string): Promise<void> {
  // In production, this would:
  // 1. Check if user is still in POST_FAILURE_SUPPORT state
  // 2. Check if previous day's action was completed
  // 3. Send appropriate message
  // 4. Update sequence state

  // For now, placeholder implementation
  debug.debug(`[Post-Failure Support] Checking scheduled messages for ${userId}`);
}

/**
 * Check if user has completed the previous day's action
 */
async function checkPreviousDayAction(userId: string, day: 2 | 3): Promise<boolean> {
  // In production, check if user completed the session from previous day
  // If they did, send encouragement
  // If they didn't, send gentle reminder without judgment

  // For now, assume they completed it
  return true;
}

/**
 * Mark post-failure support as complete
 */
export async function completePostFailureSupport(userId: string): Promise<void> {
  capture(CoachEvents.COACH_MESSAGE_RECEIVED, {
    category: "POST_FAILURE_COMPLETE",
  } as Record<string, unknown>);

  debug.debug(`[Post-Failure Support] Completed for ${userId}`);
}

// ============================================================================
// Message Content (for reference and testing)
// ============================================================================

/**
 * Get all post-failure message templates for a style
 * Useful for review and customization
 */
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

/**
 * Preview a post-failure message
 */
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
