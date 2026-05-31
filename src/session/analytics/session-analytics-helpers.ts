import type { SessionHistoryEntry, RecoveryRecord } from '../types';
import type { PatternMetrics } from './session-analytics-types';

export async function calculatePatternMetricsFromHistory(
  history: SessionHistoryEntry[],
  recoveries: RecoveryRecord[],
): Promise<PatternMetrics> {
  const hourCounts = new Array(24).fill(0);
  history.forEach((h) => {
    const hour = new Date(h.startedAt).getHours();
    if (h.status === 'COMPLETED') {
      hourCounts[hour]++;
    }
  });
  const bestTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));
  const dayCounts = new Array(7).fill(0);
  history.forEach((h) => {
    const day = new Date(h.startedAt).getDay();
    if (h.status === 'COMPLETED') {
      dayCounts[day]++;
    }
  });
  const bestDayOfWeek = dayCounts.indexOf(Math.max(...dayCounts));
  const avgInterruptionsPerSession =
    history.length > 0
      ? history.reduce((acc, h) => acc + (h.summary?.interruptions || 0), 0) /
        history.length
      : 0;
  const recoverySuccessRate =
    recoveries.length > 0
      ? (recoveries.filter((r) => r.successful).length / recoveries.length) *
        100
      : 0;
  const avgFocusQuality =
    history.length > 0
      ? history.reduce((acc, h) => acc + (h.summary?.focusQuality || 0), 0) /
        history.length
      : 0;
  return {
    bestTimeOfDay,
    bestDayOfWeek,
    avgInterruptionsPerSession,
    recoverySuccessRate,
    avgFocusQuality,
  };
}
