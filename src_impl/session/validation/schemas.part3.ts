import { z } from "zod";


export const CompleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  reflection: z.string().max(2000).optional(),
  mood: z.enum(['GREAT', 'GOOD', 'OKAY', 'STRUGGLING', 'DIFFICULT']).optional(),
  tasksCompleted: z.number().int().min(0).optional(),
  timestamp: z.number(),
});

export const AbandonSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  reason: z.string().max(500).optional(),
  timestamp: z.number(),
});

export const RecoverSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  recoveryType: z.enum(['AUTO_RESUME', 'USER_RESUME', 'STREAK_SAVE', 'PARTIAL_CREDIT', 'FULL_RESET']),
  timestamp: z.number(),
});

export function validateSessionConfig(data: unknown) {
  return ValidateSessionConfigSchema.safeParse(data);
}

export function validateSessionState(data: unknown) {
  return ValidateSessionStateSchema.safeParse(data);
}

export function validateSessionSummary(data: unknown) {
  return ValidateSessionSummarySchema.safeParse(data);
}

export function validateSessionPreset(data: unknown) {
  return ValidateSessionPresetSchema.safeParse(data);
}

export function validateInterruption(data: unknown) {
  return ValidateInterruptionSchema.safeParse(data);
}

export function validateRecoveryRecord(data: unknown) {
  return ValidateRecoveryRecordSchema.safeParse(data);
}

export function validateAntiCheatFlag(data: unknown) {
  return ValidateAntiCheatFlagSchema.safeParse(data);
}

export function validateScoreCalculation(data: unknown) {
  return ValidateScoreCalculationSchema.safeParse(data);
}

export function validateDamageCalculation(data: unknown) {
  return ValidateDamageCalculationSchema.safeParse(data);
}

export function validateFocusQualityMetrics(data: unknown) {
  return ValidateFocusQualityMetricsSchema.safeParse(data);
}

export function validatePurityHUD(data: unknown) {
  return ValidatePurityHUDSchema.safeParse(data);
}

export function validateTimerConfig(data: unknown) {
  return ValidateTimerConfigSchema.safeParse(data);
}