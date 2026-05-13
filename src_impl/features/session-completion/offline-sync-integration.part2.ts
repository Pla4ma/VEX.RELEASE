import { createDebugger } from "../../utils/debug";
import { getNetInfoAdapter } from "../../network/NetInfoAdapter";
import { useNetInfo } from "../../network/useNetInfo";
import { sessionCompletionOfflineSync } from "./offline-sync-service";
import { CompletionLedgerSchema, type CompletionLedger } from "./schemas";
import { buildCompletionLedger, type BuildCompletionLedgerInput } from "./ledger-service";


export class SessionCompletionSyncMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastHealthStatus: SessionCompletionHealthCheckResult | null = null;
  private options: Required<SessionCompletionSyncMonitorOptions>;

  constructor(options: SessionCompletionSyncMonitorOptions = {}) {
    this.options = {
      healthCheckIntervalMs: options.healthCheckIntervalMs || 60000, // 1 minute
      onHealthStatusChange: options.onHealthStatusChange || (() => {}),
    };
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    debug.info('Starting session completion sync monitor');

    // Initial health check
    this.performHealthCheck();

    // Start periodic health checks
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

      // Notify on status change
      if (!this.lastHealthStatus ||
          healthStatus.status !== this.lastHealthStatus.status ||
          healthStatus.pendingCount !== this.lastHealthStatus.pendingCount) {
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