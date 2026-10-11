import type {
  DiagnosticsResult,
  OfflineSyncReport,
} from './offline-sync-types';

export function buildOfflineSyncDiagnostics(
  entries: readonly { createdAt: number }[],
  lastSyncAt: number,
  isInitialized: boolean,
): DiagnosticsResult {
  return {
    fallbackEntriesCount: entries.length,
    lastSyncAt,
    isInitialized,
    oldestEntryAge: entries[0]
      ? Date.now() - entries[0].createdAt
      : undefined,
  };
}

export function buildOfflineSyncReport(
  diagnostics: DiagnosticsResult,
  successCount: number,
  failureCount: number,
  totalRetryCount: number,
): OfflineSyncReport {
  const issues =
    diagnostics.oldestEntryAge && diagnostics.oldestEntryAge > 86400000
      ? ['Oldest entry is older than 24 hours']
      : [];
  const totalAttempts = successCount + failureCount;
  const successRate =
    totalAttempts > 0
      ? Math.round((successCount / totalAttempts) * 100)
      : diagnostics.isInitialized
        ? 100
        : 0;
  const averageRetryCount =
    totalAttempts > 0
      ? Math.round((totalRetryCount / totalAttempts) * 100) / 100
      : 0;
  return {
    queueSize: diagnostics.fallbackEntriesCount,
    successRate,
    averageRetryCount,
    lastSyncTime: diagnostics.lastSyncAt > 0 ? diagnostics.lastSyncAt : null,
    isHealthy: issues.length === 0,
    issues,
    timestamp: Date.now(),
  };
}
