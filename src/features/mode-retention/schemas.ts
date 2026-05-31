import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';

// ── Mode retention score ────────────────────────────────────────────────
export const ModeRetentionScoreSchema = z
  .object({
    lane: LaneSchema,
    returnReasonStrength: z.number().min(0).max(10),
    nextActionClarity: z.number().min(0).max(10),
    completionContextSaved: z.number().min(0).max(10),
    memoryRelevance: z.number().min(0).max(10),
    intelligenceValue: z.number().min(0).max(10),
    nudgeSpecificity: z.number().min(0).max(10),
    totalScore: z.number().min(0).max(60),
    summary: z.string().min(1),
  })
  .strict();

// ── Mode return hook (what pulls user back tomorrow) ────────────────────
export const ModeReturnHookSchema = z
  .object({
    lane: LaneSchema,
    corePromise: z.string().min(1).max(200),
    day0Headline: z.string().min(1).max(120),
    day1Headline: z.string().min(1).max(120),
    day3MemoryHeadline: z.string().min(1).max(200),
    day7IntelligenceHeadline: z.string().min(1).max(200),
  })
  .strict();

// ── Mode-specific daily copy ────────────────────────────────────────────
export const ModeDayCopySchema = z
  .object({
    lane: LaneSchema,
    day: z.number().int().min(0).max(7),
    homeMessage: z.string().min(1).max(200),
    primaryCta: z.string().min(1).max(120),
    completionPayoff: z.string().min(1).max(300),
    nextActionCopy: z.string().min(1).max(200),
    returnReason: z.string().min(1).max(200),
    sessionMinutes: z.number().int().min(5).max(60),
  })
  .strict();

// ── Mode rescue copy ────────────────────────────────────────────────────
export const ModeRescueCopySchema = z
  .object({
    lane: LaneSchema,
    headline: z.string().min(1).max(120),
    body: z.string().min(1).max(200),
    sessionMinutes: z.number().int().min(3).max(15),
    actionLabel: z.string().min(1).max(80),
  })
  .strict();

// ── Mode notification copy ──────────────────────────────────────────────
export const ModeNotificationCopySchema = z
  .object({
    lane: LaneSchema,
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(200),
    maxPerDay: z.number().int().min(0).max(3),
  })
  .strict();

// ── Mode premium bridge ─────────────────────────────────────────────────
export const ModePremiumBridgeSchema = z
  .object({
    lane: LaneSchema,
    headline: z.string().min(1).max(200),
    featureList: z.string().min(1).max(300),
    triggerDay: z.number().int().min(0).max(7),
  })
  .strict();

// ── Mode retention manifest (full per-mode definition) ──────────────────
export const ModeRetentionManifestSchema = z
  .object({
    lane: LaneSchema,
    returnReason: z.string().min(1).max(200),
    hookCopy: z.string().min(1).max(120),
    day1Copy: z.string().min(1).max(120),
    day3Memory: z.string().min(1).max(200),
    day7Intelligence: z.string().min(1).max(200),
    rescueCopy: ModeRescueCopySchema.omit({ lane: true }),
    notificationCopy: ModeNotificationCopySchema.omit({ lane: true }),
    premiumBridge: ModePremiumBridgeSchema.omit({ lane: true, triggerDay: true }),
  })
  .strict();

// ── Inferred types ──────────────────────────────────────────────────────
export type ModeRetentionScore = z.infer<typeof ModeRetentionScoreSchema>;
export type ModeReturnHook = z.infer<typeof ModeReturnHookSchema>;
export type ModeDayCopy = z.infer<typeof ModeDayCopySchema>;
export type ModeRescueCopy = z.infer<typeof ModeRescueCopySchema>;
export type ModeNotificationCopy = z.infer<typeof ModeNotificationCopySchema>;
export type ModePremiumBridge = z.infer<typeof ModePremiumBridgeSchema>;
export type ModeRetentionManifest = z.infer<typeof ModeRetentionManifestSchema>;
