export interface SessionStake {
  id: string;
  priority: number;
  icon: string;
  title: string;
  subtitle: string;
  urgency: "critical" | "high" | "medium" | "low";
  accentColor?: string;
}

export interface SessionStakesBriefingProps {
  bossStake?: {
    bossName: string;
    healthPercent: number;
    estimatedDamage: number;
    wouldDefeat: boolean;
    isFinalStrike: boolean;
  } | null;
  streakStake?: {
    currentDays: number;
    sessionNumberInStreak: number;
    multiplier: number;
    isAtRisk: boolean;
    hoursUntilDeadline: number | null;
  } | null;
  challengeStake?: {
    challengeName: string;
    current: number;
    target: number;
    canComplete: boolean;
  } | null;
  rivalStake?: {
    rivalName: string;
    theirMinutes: number;
    myMinutes: number;
    gapMinutes: number;
  } | null;
  squadWarStake?: {
    hoursRemaining: number;
    squadMinutesNeeded: number;
    myContribution: number;
  } | null;
  onStakePress?: (stakeId: string) => void;
}
