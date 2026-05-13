import { z } from 'zod';

const JourneyStateSchema = z
  .object({
    chapter: z.number().int().min(1),
    isNearMilestone: z.boolean(),
    progressPercent: z.number().min(0).max(100),
    rung: z.number().int().min(1),
    rungLabel: z.string().min(1),
    totalRungs: z.number().int().min(1),
  })
  .strict();

export type JourneyState = z.infer<typeof JourneyStateSchema>;

const RUNG_XP = [0, 80, 220, 420, 700, 1080, 1600, 2300, 3200, 4400] as const;
const RUNG_LABELS = [
  'Warm-Up',
  'Locked In',
  'Steady Flow',
  'Deep Work',
  'Momentum',
  'Builder',
  'Specialist',
  'Mastery Track',
  'Elite Focus',
] as const;

export function getJourneyState(totalXp: number): JourneyState {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const rungIndex = getRungIndex(safeXp);
  const currentFloor = RUNG_XP[rungIndex];
  const nextCeiling = RUNG_XP[Math.min(rungIndex + 1, RUNG_XP.length - 1)];
  const range = Math.max(1, nextCeiling - currentFloor);
  const progressPercent = Math.min(100, Math.floor(((safeXp - currentFloor) / range) * 100));
  const chapter = Math.floor(rungIndex / 3) + 1;

  return JourneyStateSchema.parse({
    chapter,
    isNearMilestone: progressPercent >= 85 && rungIndex < RUNG_LABELS.length - 1,
    progressPercent,
    rung: rungIndex + 1,
    rungLabel: RUNG_LABELS[Math.min(rungIndex, RUNG_LABELS.length - 1)],
    totalRungs: RUNG_LABELS.length,
  });
}

export function getJourneyCrossingReward(previousTotalXp: number, newTotalXp: number): string | null {
  const before = getRungIndex(previousTotalXp);
  const after = getRungIndex(newTotalXp);
  if (after <= before) {
    return null;
  }
  return `journey:rung:${after + 1}`;
}

export function getJourneyReturnHook(state: JourneyState): string {
  if (state.isNearMilestone) {
    return `One more clean session unlocks ${state.rungLabel}.`;
  }
  return `Chapter ${state.chapter} is active. Keep stacking focused reps.`;
}

function getRungIndex(totalXp: number): number {
  let idx = 0;
  for (let i = 0; i < RUNG_XP.length; i += 1) {
    if (totalXp >= RUNG_XP[i]) {
      idx = i;
    }
  }
  return Math.min(idx, RUNG_LABELS.length - 1);
}
