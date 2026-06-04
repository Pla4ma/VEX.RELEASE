export type InterventionType = 'BURNOUT' | 'PLATEAU' | 'STREAK_RISK' | 'BOSS_FINISH';

export interface CoachMetrics {
  userId: string;
  event: string;
  timestamp: number;
  properties: Record<string, unknown>;
}
