export interface BossEngagementSignal {
  type: string;
  value: number;
}
export interface BossEngagementInputs {
  bossIgnored?: boolean;
  bossUnlocked?: boolean;
  canQueryBoss?: boolean;
  bossRouteOpenedCount?: number;
  bossCTAClickedCount?: number;
  bossDamageEventsCount?: number;
  recentSessionsWithBossProgress?: number;
}
export function getBossEngagementSignals(
  _inputs: BossEngagementInputs,
): BossEngagementSignal[] {
  return [];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useBossEngagementSignals(
  inputs: BossEngagementInputs,
): BossEngagementInputs & { signals: BossEngagementSignal[] } {
  return { signals: [], ...inputs };
}
export type BossEngagementLevel = "none" | "low" | "medium" | "high";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function deriveBossEngagementLevel(
  _inputs: BossEngagementInputs,
): BossEngagementLevel {
  return "none";
}
