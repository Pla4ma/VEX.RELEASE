import { createDebugger } from '../../utils/debug';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';
import { sessionCompletionOfflineSync } from './offline-sync-service';

const debug = createDebugger('session-completion:offline-health');

export interface SessionCompletionHealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  pendingCount: number;
  oldestPendingAgeMinutes?: number;
  minutesSinceLastSync?: number;
  recommendations: string[];
  isOnline: boolean;
}

export async function performSessionCompletionHealthCheck(): Promise<SessionCompletionHealthCheckResult> {
  const networkState = getNetInfoAdapter().getCurrentState();
  const isOnline =
    networkState.isConnected && (networkState.isInternetReachable ?? false);
  const diagnostics = sessionCompletionOfflineSync.getDiagnostics();
  const now = Date.now();
  const pendingCount = diagnostics.fallbackEntriesCount;
  const oldestAgeMinutes = diagnostics.oldestEntryAge
    ? Math.floor(diagnostics.oldestEntryAge / (1000 * 60))
    : undefined;
  const minutesSinceLastSync = diagnostics.lastSyncAt
    ? Math.floor((now - diagnostics.lastSyncAt) / (1000 * 60))
    : undefined;
  const recommendations: string[] = [];
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (pendingCount > 10) {
    status = 'critical';
    recommendations.push(
      'High number of pending sessions - check network connectivity',
    );
  } else if (pendingCount > 3) {
    status = 'warning';
    recommendations.push('Several sessions pending sync');
  }
  if (oldestAgeMinutes && oldestAgeMinutes > 60) {
    status = status === 'healthy' ? 'warning' : 'critical';
    recommendations.push('Some sessions have been pending for over an hour');
  } else if (oldestAgeMinutes && oldestAgeMinutes > 15) {
    if (status === 'healthy') {
      status = 'warning';
    }
    recommendations.push('Some sessions have been pending for over 15 minutes');
  }
  if (minutesSinceLastSync && minutesSinceLastSync > 30) {
    status = status === 'healthy' ? 'warning' : 'critical';
    recommendations.push('No successful sync in over 30 minutes');
  }
  if (!isOnline) {
    status = 'critical';
    recommendations.push('Device is offline - session completions will queue');
  }
  if (status === 'healthy') {
    recommendations.push('Session completion sync is operating normally');
  }
  return {
    status,
    pendingCount,
    oldestPendingAgeMinutes: oldestAgeMinutes,
    minutesSinceLastSync,
    recommendations,
    isOnline,
  };
}

export interface SessionCompletionSyncMonitorOptions {
  healthCheckIntervalMs?: number;
  onHealthStatusChange?: (status: SessionCompletionHealthCheckResult) => void;
}

export class SessionCompletionSyncMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastHealthStatus: SessionCompletionHealthCheckResult | null = null;
  private options: Required<SessionCompletionSyncMonitorOptions>;

  constructor(options: SessionCompletionSyncMonitorOptions = {}) {
    this.options = {
      healthCheckIntervalMs: options.healthCheckIntervalMs || 60000,
      onHealthStatusChange: options.onHealthStatusChange || (() => {}),
    };
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }
    debug.info('Starting session completion sync monitor');
    this.performHealthCheck();
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      debug.info('Stopped session completion sync monitor');
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const healthStatus = await performSessionCompletionHealthCheck();
      if (
        !this.lastHealthStatus ||
        healthStatus.status !== this.lastHealthStatus.status ||
        healthStatus.pendingCount !== this.lastHealthStatus.pendingCount
      ) {
        this.options.onHealthStatusChange(healthStatus);
      }
      this.lastHealthStatus = healthStatus;
    } catch (error) {
      debug.error('Health check failed:', error);
    }
  }

  getLastHealthStatus(): SessionCompletionHealthCheckResult | null {
    return this.lastHealthStatus;
  }
}
