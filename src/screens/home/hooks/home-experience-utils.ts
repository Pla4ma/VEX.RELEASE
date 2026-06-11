import type {} from '../../../features/personalization/behavior-signal-schemas';
import type { MotivationStyle } from '../../../features/personalization/schemas';
import type { HomeController } from './home-controller-types';

interface SessionEntry {
  status?: string;
  duration?: number;
  effectiveDuration?: number;
  mode?: string;
  endedAt?: number;
  startTime?: number;
  focusQuality?: number;
  config?: { sessionMode?: string; studyPlanId?: string };
}

export const VALID_SESSION_MODES = [
  'FOCUS',
  'STUDY',
  'DEEP_WORK',
  'SPRINT',
  'CREATIVE',
  'RECOVERY',
] as const;
export type ValidSessionMode = (typeof VALID_SESSION_MODES)[number];

export function normalizeMotivationStyle(
  style: string | null,
): MotivationStyle {
  switch (style) {
    case 'calm':
    case 'friendly':
    case 'coach_led':
    case 'game_like':
    case 'intense':
    case 'study_focused':
      return style;
    case 'worker':
      return 'coach_led';
    default:
      return 'calm';
  }
}

export function resolvePrimaryGoal(goal: string | null): string {
  switch (goal) {
    case 'STUDY':
      return 'study';
    case 'WORK':
      return 'work';
    case 'CREATIVE':
      return 'creative';
    case 'LEARNING':
      return 'learning';
    case 'PERSONAL':
      return 'personal';
    default:
      return 'focus';
  }
}

export function computeDaysSinceTimestamp(ts: number): number {
  return Math.max(0, Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)));
}

export function computeCompletedDurations(sessions: SessionEntry[]): number[] {
  return sessions
    .map((s) => s.effectiveDuration ?? s.duration ?? 0)
    .filter((d) => d > 0);
}

export function computeAbandonedDurations(sessions: SessionEntry[]): number[] {
  return sessions
    .map((s) => s.effectiveDuration ?? s.duration ?? 0)
    .filter((d) => d > 0);
}

export function computePreferredMode(
  sessions: SessionEntry[],
): ValidSessionMode | null {
  const recent = sessions.slice(-10);
  if (recent.length === 0) {return null;}
  const modeCounts = new Map<string, number>();
  for (const s of recent) {
    const mode = s.mode ?? s.config?.sessionMode;
    if (mode) {modeCounts.set(mode, (modeCounts.get(mode) ?? 0) + 1);}
  }
  if (modeCounts.size === 0) {return null;}
  const entries = Array.from(modeCounts.entries()).sort((a, b) => b[1] - a[1]);
  const best = entries[0]?.[0];
  if (!best) {return null;}
  return (VALID_SESSION_MODES as readonly string[]).includes(best)
    ? (best as ValidSessionMode)
    : null;
}

export function computeBestTimeOfDay(sessions: SessionEntry[]): string | null {
  const qualitySessions = sessions.filter(
    (s) =>
      typeof s.focusQuality === 'number' && typeof s.startTime === 'number',
  );
  if (qualitySessions.length < 3) {return null;}
  qualitySessions.sort((a, b) => (b.focusQuality ?? 0) - (a.focusQuality ?? 0));
  const top = qualitySessions.slice(0, Math.min(3, qualitySessions.length));
  const avgHour =
    top.reduce((sum, s) => {
      const date = new Date((s.startTime ?? 0) * 1000);
      return sum + date.getHours();
    }, 0) / top.length;
  const hour = Math.round(avgHour);
  if (hour < 6) {return 'early_morning';}
  if (hour < 12) {return 'morning';}
  if (hour < 17) {return 'afternoon';}
  if (hour < 21) {return 'evening';}
  return 'night';
}

export function computeStudyUsageRatio(
  completedSessions: SessionEntry[],
  totalCompleted: number,
): number {
  if (totalCompleted === 0 || completedSessions.length === 0) {return 0;}
  const studySessions = completedSessions.filter(
    (s) =>
      s.mode === 'STUDY' ||
      s.config?.sessionMode === 'STUDY' ||
      Boolean(s.config?.studyPlanId),
  );
  return Math.min(1, studySessions.length / totalCompleted);
}

export function computeCoachInteractions(controller: HomeController): number {
  let count = 0;
  if (controller.primaryRecommendation) {count += 1;}
  const recsData = controller.recommendationsQuery?.data as
    | { items?: Array<{ status?: string }> }
    | Array<{ status?: string }>
    | undefined;
  if (recsData) {
    const items = Array.isArray(recsData) ? recsData : (recsData.items ?? []);
    count += items.filter((r) => r.status === 'ACCEPTED').length;
  }
  return count;
}

export function computeBossEngagement(
  controller: HomeController,
  hasActiveBoss: boolean,
): 'none' | 'low' | 'medium' | 'high' {
  if (!hasActiveBoss) {return 'none';}
  const bossData = controller.activeBossQuery?.data as
    | { damageTaken?: number; maxHealth?: number; encounters?: number }
    | undefined;
  if (!bossData) {return 'low';}
  const encounterCount = bossData.encounters ?? 0;
  if (encounterCount >= 3) {return 'high';}
  if (encounterCount >= 1) {return 'medium';}
  return 'low';
}

export function computeComebackSessions(controller: HomeController): number {
  const comebackData = controller.comebackQuery?.data as
    | { isComeback?: boolean; streakRestoreEligible?: boolean }
    | undefined;
  if (!comebackData?.streakRestoreEligible) {return 0;}
  const history = (
    controller.historyQuery as { history: Array<{ status: string }> }
  ).history;
  return history?.filter((e) => e.status === 'COMPLETED').length ?? 0;
}
