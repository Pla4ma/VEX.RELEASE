import type { Experiment } from './ab-types';

export interface ExperimentStatsResult {
  totalAssignments: number;
  variantAssignments: Record<string, number>;
  dailyAssignments: Array<{ date: string; count: number }>;
}

export interface ExperimentOverviewResult {
  totalExperiments: number;
  runningExperiments: number;
  completedExperiments: number;
  totalAssignments: number;
  experimentsByType: Record<string, number>;
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = hash * 32 - hash + char;
  }
  return Math.abs(hash);
}

export function isUserEligibleForExperiment(
  _userId: string,
  _experiment: Experiment,
): boolean {
  return true;
}

export function selectVariant(
  userId: string,
  experiment: Experiment,
): string | null {
  const hash = hashString(userId + experiment.id);
  const bucket = hash % 100;
  let cumulativePercentage = 0;
  for (const [variantId, percentage] of Object.entries(
    experiment.trafficAllocation,
  )) {
    cumulativePercentage += percentage;
    if (bucket < cumulativePercentage) {
      return variantId;
    }
  }
  return experiment.controlVariant.id;
}
