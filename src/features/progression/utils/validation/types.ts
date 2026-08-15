import { z } from 'zod';

// ── Schemas ─────────────────────────────────────────────────────────────────

export const XPSourceSchema = z.enum([
  'SESSION_COMPLETE',
  'SESSION_QUALITY',
  'STREAK_BONUS',
  'CHALLENGE_COMPLETE',
  'BOSS_DAMAGE',
  'BOSS_DEFEAT',
  'ACHIEVEMENT_UNLOCK',
  'DAILY_LOGIN',
  'REFERRAL',
  'PROMOTION',
  'ADMIN_GRANT',
  'REFUND',
]);

export const XPTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number().int().min(0),
  source: XPSourceSchema,
  sourceId: z.string().optional(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  applied: z.boolean().default(false),
});

export type XPTransaction = z.infer<typeof XPTransactionSchema>;

// ── Constants ───────────────────────────────────────────────────────────────

export const MAX_XP_PER_SESSION = 10000;
export const MAX_XP_PER_HOUR = 15000;
export const MAX_STREAK_BONUS_MULTIPLIER = 5;
export const MAX_QUALITY_BONUS = 3;

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  violations: Violation[];
  warnings: Warning[];
  riskScore: number;
}

export interface Violation {
  type: 'RATE_LIMIT' | 'IMPOSSIBLE' | 'SUSPICIOUS' | 'POLICY';
  field: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, unknown>;
}

export interface Warning {
  field: string;
  message: string;
  code: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getNumberFromMetadata(
  metadata: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' ? value : undefined;
}
