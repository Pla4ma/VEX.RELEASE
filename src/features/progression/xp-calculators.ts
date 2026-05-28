export function calculateDurationMasteryXp(
  sessionMinutes: number,
  wasInterrupted: boolean,
  purityScore: number,
): number {
  if (wasInterrupted) {
    return 0;
  }
  let xp = Math.floor(sessionMinutes * 0.5);
  const purityMultiplier = 0.5 + (purityScore / 100) * 1.5;
  xp = Math.floor(xp * purityMultiplier);
  if (sessionMinutes >= 90) {
    xp += 50;
  }
  if (sessionMinutes >= 60 && purityScore >= 90) {
    xp += 30;
  }
  return xp;
}

export function calculatePurityMasteryXp(
  purityScore: number,
  sessionMinutes: number,
  pauseCount: number,
): number {
  if (purityScore < 70) {
    return 0;
  }
  let xp = Math.floor(purityScore / 5);
  if (pauseCount === 0) {
    xp *= 2;
  }
  if (sessionMinutes >= 45) {
    xp += 20;
  }
  if (purityScore >= 95) {
    xp += 50;
  }
  return xp;
}

export function calculateConsistencyMasteryXp(
  streakDays: number,
  sessionsToday: number,
  daysActiveThisWeek: number,
): number {
  let xp = 10;
  const streakMultiplier = Math.min(3, 1 + streakDays * 0.05);
  xp = Math.floor(xp * streakMultiplier);
  if (sessionsToday >= 2) {
    xp += 15;
  }
  if (sessionsToday >= 3) {
    xp += 25;
  }
  if (daysActiveThisWeek >= 5) {
    xp += 20;
  }
  return xp;
}

export function calculateComebackMasteryXp(
  isComeback: boolean,
  daysSinceLastSession: number,
  previousStreak: number,
): number {
  if (!isComeback) {
    return 0;
  }
  let xp = 25;
  if (daysSinceLastSession === 1) {
    xp += 50;
  } else if (daysSinceLastSession <= 3) {
    xp += 25;
  }
  if (previousStreak >= 30) {
    xp += 50;
  } else if (previousStreak >= 14) {
    xp += 30;
  }
  return xp;
}

export function calculateBossMasteryXp(
  bossDefeated: boolean,
  bossHealthPercent: number,
  damageDealt: number,
  fightDuration: number,
  criticalHits: number,
): number {
  if (!bossDefeated) {
    return Math.floor(damageDealt / 100);
  }
  let xp = 100;
  const speedBonus = Math.floor((1 - bossHealthPercent) * 50);
  xp += speedBonus;
  xp += criticalHits * 15;
  if (fightDuration < 60 && bossHealthPercent < 0.5) {
    xp += 50;
  }
  return xp;
}
