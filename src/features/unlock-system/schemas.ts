import { z } from 'zod';

export const SignalTypeSchema = z.enum([
  'session_completed',
  'plan_item_created',
  'plan_item_completed',
  'capture_created',
  'coach_interaction',
  'streak_maintained',
  'project_created',
  'study_plan_created',
]);

export const CompositeScoreSchema = z.object({
  total: z.number().min(0),
  sessionScore: z.number().min(0).default(0),
  planScore: z.number().min(0).default(0),
  captureScore: z.number().min(0).default(0),
  coachScore: z.number().min(0).default(0),
  streakScore: z.number().min(0).default(0),
  signalsUsed: z.number().min(0).default(0),
});

export const FeatureUnlockStateSchema = z.object({
  featureId: z.string(),
  unlocked: z.boolean(),
  progress: z.number().min(0).max(100),
  requiredScore: z.number().min(0),
  currentScore: z.number().min(0),
  remainingScore: z.number().min(0),
  teaser: z.boolean().default(false),
});
