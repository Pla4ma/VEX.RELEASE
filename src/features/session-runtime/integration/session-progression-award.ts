import { z } from 'zod';

import { SessionSummarySchema, type SessionSummary } from '../types';

const SessionProgressAwardInputSchema = z.object({
  companionXpMultiplier: z.number().min(0).default(1),
  newStreakDays: z.number().int().min(0),
  sessionId: z.string().uuid(),
  summary: SessionSummarySchema.passthrough(),
  userId: z.string().uuid(),
});

const BonusSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const DamageSchema = z
  .object({
    totalDamage: z.number().optional(),
  })
  .passthrough();

export type SessionProgressAwardInput = z.infer<
  typeof SessionProgressAwardInputSchema
>;

export interface SessionProgressAward {
  amount: number;
  metadata: Record<string, unknown>;
  sessionId: string;
}

function getSessionMinutes(summary: SessionSummary): number {
  return Math.max(0, Math.floor(summary.effectiveDuration / 60000));
}

function isPerfectSession(summary: SessionSummary): boolean {
  return (
    summary.interruptions === 0 &&
    summary.pauses === 0 &&
    summary.completionPercentage >= 100
  );
}

export function buildSessionProgressAward(
  input: SessionProgressAwardInput,
): SessionProgressAward {
  const parsed = SessionProgressAwardInputSchema.parse(input);
  const minutes = getSessionMinutes(parsed.summary);
  const baseAmount = minutes * 25 + Math.max(0, parsed.summary.finalScore ?? 0);
  const damage = DamageSchema.safeParse(parsed.summary.damage);
  const bonuses = z.array(BonusSchema).safeParse(parsed.summary.bonuses);
  const amount = Math.max(
    1,
    Math.floor(baseAmount * parsed.companionXpMultiplier),
  );

  return {
    amount,
    sessionId: parsed.sessionId,
    metadata: {
      bossActive: Boolean(damage.success ? damage.data.totalDamage : 0),
      comebackActive: (bonuses.success ? bonuses.data : []).some(
        (bonus) => bonus.type === 'COMEBACK_BONUS',
      ),
      effectiveDurationMs: parsed.summary.effectiveDuration,
      focusQuality:
        parsed.summary.focusPurityScore ?? parsed.summary.focusQuality,
      perfectSession: isPerfectSession(parsed.summary),
      sourceVersion: 'session-progress-award/v1',
      streakDays: parsed.newStreakDays,
      tasksCompleted: parsed.summary.tasksCompleted ?? 0,
    },
  };
}
