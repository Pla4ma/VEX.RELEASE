export interface StreakSurvivalMetrics {
  totalStreaksStarted: number;
  streaksBroken: number;
  streaksProtected: number;
  survivalRate: number;
  avgStreakLength: number;
  insuranceUsageRate: number;
}

let streakMetrics: StreakSurvivalMetrics = {
  totalStreaksStarted: 0,
  streaksBroken: 0,
  streaksProtected: 0,
  survivalRate: 0,
  avgStreakLength: 0,
  insuranceUsageRate: 0,
};

export function trackStreakEvent(
  event: 'start' | 'break' | 'protect' | 'milestone',
  data?: { length?: number; insuranceUsed?: boolean },
): void {
  switch (event) {
    case 'start':
      streakMetrics.totalStreaksStarted++;
      break;
    case 'break':
      streakMetrics.streaksBroken++;
      break;
    case 'protect':
      streakMetrics.streaksProtected++;
      break;
    case 'milestone':
      if (data?.length) {
        const totalLength =
          streakMetrics.avgStreakLength *
            (streakMetrics.totalStreaksStarted - 1) +
          data.length;
        streakMetrics.avgStreakLength =
          totalLength / streakMetrics.totalStreaksStarted;
      }
      break;
  }
  const completedStreaks =
    streakMetrics.streaksBroken + streakMetrics.streaksProtected;
  streakMetrics.survivalRate =
    completedStreaks > 0
      ? streakMetrics.streaksProtected / completedStreaks
      : 1;
  streakMetrics.insuranceUsageRate =
    streakMetrics.streaksProtected > 0
      ? streakMetrics.streaksProtected /
        (streakMetrics.streaksProtected + streakMetrics.streaksBroken)
      : 0;
}

export function getStreakSurvivalMetrics(): StreakSurvivalMetrics {
  return { ...streakMetrics };
}
