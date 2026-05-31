import { z } from 'zod';

export const CoachSuggestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'DAILY_MISSION',
    'SESSION_RECOMMENDATION',
    'STREAK_PROTECTION',
  ]),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  suggestedAction: z.string().max(200),
  confidence: z.number().min(0).max(1),
  expiresAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  canBecomeMission: z.boolean(),
});

export type CoachSuggestion = z.infer<typeof CoachSuggestionSchema>;

export const PriorityEngineSchema = z.object({
  streakCritical: z.boolean(),
  pendingSync: z.boolean(),
  coachNextAction: z.boolean(),
  dailyMissionReminder: z.boolean(),
  squadHelp: z.boolean(),
});

export type PriorityEngine = z.infer<typeof PriorityEngineSchema>;

export type CoachPriority = CoachSuggestion['priority'];
