export const THRESHOLDS = {
  dbResponseMs: 1000,
  queueDepth: 100,
  errorRatePercent: 5,
  diskUsagePercent: 85,
};

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message: string;
  responseTime?: number;
  queueDepth?: number;
  errorRate?: number;
  activeSeasons?: number;
  recentTransactions?: number;
}
