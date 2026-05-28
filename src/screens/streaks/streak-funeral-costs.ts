const RESTORE_COSTS = {
  UNDER_7_DAYS: 100,
  DAYS_7_TO_29: 200,
  DAYS_30_PLUS: 500,
} as const;

export function calculateRestoreCost(streakDays: number): number {
  if (streakDays < 7) {
    return RESTORE_COSTS.UNDER_7_DAYS;
  }
  if (streakDays < 30) {
    return RESTORE_COSTS.DAYS_7_TO_29;
  }
  return RESTORE_COSTS.DAYS_30_PLUS;
}
