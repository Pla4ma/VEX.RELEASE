export function calculateRestoreCost(streakDays: number): number {
  if (streakDays < 7) {
    return 100;
  }
  if (streakDays < 30) {
    return 200;
  }
  return 500;
}
