import type { z } from "zod";
import {
  ProgressionSchema,
  ProgressionSummarySchema,
  XpSourceSchema,
  XpMetadataSchema,
  XpEntrySchema,
  XpBreakdownSchema,
  LevelUpRecordSchema,
  UnlockTypeSchema,
  UnlockSchema,
  MilestoneTypeSchema,
  MilestoneRewardTypeSchema,
  MilestoneSchema,
  ProgressionTierSchema,
  AddXpInputSchema,
  PrestigeInputSchema,
  PrestigeRewardPreviewSchema,
  AddXpResultSchema,
  LevelUpResultSchema,
} from "./schemas";

export type Progression = z.infer<typeof ProgressionSchema>;
export type ProgressionSummary = z.infer<typeof ProgressionSummarySchema>;
export type XpSource = z.infer<typeof XpSourceSchema>;
export type XpMetadata = z.infer<typeof XpMetadataSchema>;
export type XpEntry = z.infer<typeof XpEntrySchema>;
export type XpBreakdown = z.infer<typeof XpBreakdownSchema>;
export type LevelUpRecord = z.infer<typeof LevelUpRecordSchema>;
export type UnlockType = z.infer<typeof UnlockTypeSchema>;
export type Unlock = z.infer<typeof UnlockSchema>;
export type MilestoneType = z.infer<typeof MilestoneTypeSchema>;
export type MilestoneRewardType = z.infer<typeof MilestoneRewardTypeSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type ProgressionTier = z.infer<typeof ProgressionTierSchema>;
export type AddXpInput = z.infer<typeof AddXpInputSchema>;
export type PrestigeInput = z.infer<typeof PrestigeInputSchema>;
export type PrestigeRewardPreview = z.infer<typeof PrestigeRewardPreviewSchema>;
export type AddXpResult = z.infer<typeof AddXpResultSchema>;
export type LevelUpResult = z.infer<typeof LevelUpResultSchema>;

// Service operation types (merged from service-enhanced-types)

export interface AddXpOperationResult {
  success: boolean;
  progression: Progression | null;
  xpAdded: number;
  levelUpOccurred: boolean;
  previousLevel: number;
  newLevel: number;
  breakdown: XpBreakdown;
  rewards: string[];
  error: ProgressionError | null;
  offlineQueued: boolean;
}

export interface ProgressionError {
  code: "VALIDATION" | "NETWORK" | "CONFLICT" | "UNKNOWN" | "RATE_LIMIT";
  message: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}
