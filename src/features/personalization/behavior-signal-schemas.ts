import { z } from 'zod';

export const BehaviorSignalTypeSchema = z.enum([
  'surface_seen',
  'surface_clicked',
  'surface_dismissed',
  'premium_gate_seen',
  'premium_gate_clicked',
  'premium_gate_dismissed',
  'boss_cta_clicked',
  'boss_route_opened',
  'study_surface_clicked',
  'coach_surface_clicked',
  'notification_opened',
  'notification_dismissed',
]);

export type BehaviorSignalType = z.infer<typeof BehaviorSignalTypeSchema>;

export const BehaviorSignalSourceSchema = z.enum([
  'home_hero',
  'home_content',
  'home_lower',
  'premium_gate',
  'boss_tab',
  'coach_presence',
  'study_layer',
  'notification_center',
  'session_completion',
  'paywall',
]);

export type BehaviorSignalSource = z.infer<typeof BehaviorSignalSourceSchema>;

export const BehaviorSignalMetadataSchema = z.object({
  surfacePlacement: z.string().min(1).optional(),
  sessionCount: z.number().int().min(0).optional(),
}).strict();

export const BehaviorSignalSchema = z.object({
  userId: z.string().uuid(),
  surfaceKey: z.string().min(1),
  signalType: BehaviorSignalTypeSchema,
  source: BehaviorSignalSourceSchema,
  timestamp: z.number().int().min(0),
  metadata: BehaviorSignalMetadataSchema.optional(),
}).strict();

export type BehaviorSignal = z.infer<typeof BehaviorSignalSchema>;

export const BehaviorSignalSummarySchema = z.object({
  ignoredFeatures: z.array(z.string().min(1)),
  premiumFeatureAttempts: z.array(z.string().min(1)),
  bossEngagement: z.enum(['none', 'low', 'medium', 'high']),
  coachInteractions: z.number().int().min(0),
  studyUsageRatio: z.number().min(0).max(1),
  deepWorkUsageRatio: z.number().min(0).max(1),
  learningUsageRatio: z.number().min(0).max(1),
  projectFocusUsageRatio: z.number().min(0).max(1),
  structuredExecutionUsageRatio: z.number().min(0).max(1),
  preferredSessionMode: z.string().min(1).nullable(),
  mostSuccessfulTimeOfDay: z.string().min(1).nullable(),
  dismissedSurfaces: z.array(z.string().min(1)),
  highIntentPremiumActions: z.array(z.string().min(1)),
  lastWindowSignalCount: z.number().int().min(0),
}).strict();

export type BehaviorSignalSummary = z.infer<typeof BehaviorSignalSummarySchema>;

export const BehaviorSignalWindowSchema = z.object({
  maxAgeMs: z.number().int().min(60_000).default(7 * 24 * 60 * 60 * 1000),
  maxSignals: z.number().int().min(5).max(200).default(20),
}).strict();

export const BehaviorResolverInputSchema = z.object({
  recentSignals: z.array(BehaviorSignalSchema),
  recentSessions: z.object({
    completedSessions: z.number().int().min(0),
    studySessions: z.number().int().min(0),
    deepWorkSessions: z.number().int().min(0).optional().default(0),
    learningSessions: z.number().int().min(0).optional().default(0),
    creativeSessions: z.number().int().min(0).optional().default(0),
    totalSessions: z.number().int().min(0),
    preferredMode: z.string().min(1).nullable(),
    bestTimeOfDay: z.string().min(1).nullable(),
  }).strict(),
  firstWeekExperience: z.object({
    stage: z.string().min(1),
    isDayZero: z.boolean(),
  }).strict(),
}).strict();

export type BehaviorResolverInput = z.infer<typeof BehaviorResolverInputSchema>;
