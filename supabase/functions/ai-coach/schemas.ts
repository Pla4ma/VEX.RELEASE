import { z } from 'https://esm.sh/zod@3.22.4';

export const PersonaSchema = z.enum(['CHEERLEADER', 'DRILL_SERGEANT', 'FRIEND', 'MENTOR', 'RIVAL', 'MINDFUL']);
export const AIRequestTypeSchema = z.enum(['GENERATE_COACH_MESSAGE', 'GENERATE_SESSION_SUMMARY', 'GENERATE_COMEBACK_PROMPT', 'GENERATE_STREAK_RISK_NUDGE', 'GENERATE_WEEKLY_REFLECTION', 'GENERATE_AGENT_DECISION']);
export const AIActionIntentSchema = z.enum(['START_SESSION', 'VIEW_PROGRESS', 'VIEW_SETTINGS', 'START_COMEBACK', 'VIEW_BOSS', 'VIEW_CHALLENGES', 'VIEW_SQUAD', 'VIEW_SHOP', 'OPEN_COACH', 'OPEN_CONTENT_STUDY', 'NONE']);

export const CoachPayloadSchema = z.object({ message: z.string().min(1).max(1000), tone: z.string().min(1).max(50), urgency: z.enum(['low', 'medium', 'high', 'critical']), actionLabel: z.string().min(1).max(60).optional(), action: AIActionIntentSchema.optional() }).strict();
export const CoachAgentDecisionSchema = z.object({ decisionId: z.string().min(1), userId: z.string().min(1), type: z.enum(['START_SESSION', 'RESCUE_STREAK', 'CONTINUE_STUDY_PLAN', 'REVIEW_PROGRESS', 'NO_ACTION']), message: z.string().min(1).max(220), reasonCode: z.enum(['STREAK_AT_RISK', 'LOW_ENERGY_PATTERN', 'ACTIVE_STUDY_PLAN', 'RECENT_MISSED_SESSION', 'ENOUGH_DONE_TODAY']), confidence: z.number().min(0).max(1), actionPayload: z.record(z.unknown()).optional(), expiresAt: z.string().datetime(), evidence: z.object({ sessionIds: z.array(z.string()).optional(), memoryIds: z.array(z.string()).optional(), studyPackIds: z.array(z.string()).optional() }), policy: z.object({ requiresUserConfirmation: z.literal(true), canAutoExecute: z.literal(false) }) }).strict();

const CoachContextSchema = z.object({ category: z.enum(['STREAK_RISK', 'SESSION_SUGGESTION', 'MILESTONE_HYPE', 'COMEBACK_SUPPORT', 'POST_FAILURE', 'PROGRESS_REMINDER', 'DIFFICULTY_ADJUST', 'CHALLENGE_PROMPT', 'MOTIVATION_BOOST', 'BREAK_SUGGESTION', 'OVERLOAD_WARNING']), currentStreak: z.number().optional(), currentLevel: z.number().optional(), hoursSinceLastSession: z.number().optional(), recentSessionQuality: z.number().optional(), daysInactive: z.number().optional(), personaStyle: PersonaSchema.optional(), recentSessionOutcomes: z.array(z.object({ score: z.number(), focusQuality: z.number().optional(), durationMinutes: z.number().optional() }).strict()).max(3).optional() }).passthrough();

const SummaryContextSchema = z.object({ sessionCount: z.number(), totalFocusMinutes: z.number(), averageSessionQuality: z.number(), streakDays: z.number(), xpEarned: z.number(), challengesCompleted: z.number() }).passthrough();
const AgentContextSchema = z.object({ userId: z.string().min(1), isOnline: z.boolean(), completedToday: z.boolean(), currentStreak: z.number(), hoursUntilStreakDeadline: z.number().nullable(), recentSessionIds: z.array(z.string()), activeStudyPackId: z.string().nullable(), lowEnergyPattern: z.boolean(), trustLevel: z.enum(['low', 'normal']) }).strict();

export const AIRequestSchema = z.discriminatedUnion('requestType', [
  z.object({ requestType: z.literal('GENERATE_COACH_MESSAGE'), userId: z.string().min(1), context: CoachContextSchema, personaId: z.string().uuid().optional() }),
  z.object({ requestType: z.literal('GENERATE_SESSION_SUMMARY'), userId: z.string().min(1), context: SummaryContextSchema }),
  z.object({ requestType: z.literal('GENERATE_COMEBACK_PROMPT'), userId: z.string().min(1), context: z.record(z.unknown()) }),
  z.object({ requestType: z.literal('GENERATE_STREAK_RISK_NUDGE'), userId: z.string().min(1), context: z.record(z.unknown()) }),
  z.object({ requestType: z.literal('GENERATE_WEEKLY_REFLECTION'), userId: z.string().min(1), context: z.record(z.unknown()) }),
  z.object({ requestType: z.literal('GENERATE_AGENT_DECISION'), userId: z.string().min(1), context: AgentContextSchema }),
]);

export type AIRequest = z.infer<typeof AIRequestSchema>;
