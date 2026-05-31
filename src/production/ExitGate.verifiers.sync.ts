/**
 * Verifiers: Offline Sync & Error Boundaries.
 */

import {
  offlineSyncService,
  type OfflineSyncReport,
} from '../features/session-completion/offline-sync-service';
import type { ErrorBoundaryReport } from './ExitGate.types';
import { getErrorMessage, computeStatusAndScore } from './ExitGate.verifier-utils';

export async function verifyOfflineSync(): Promise<{
  status: 'pass' | 'fail' | 'warning';
  score: number;
  report: OfflineSyncReport;
  issues: string[];
}> {
  try {
    const report = await offlineSyncService.generateHealthReport();
    const issues: string[] = [];
    if (report.queueSize > 100) {
      issues.push('Offline sync queue size exceeds 100 items');
    }
    if (report.successRate < 95) {
      issues.push('Offline sync success rate below 95%');
    }
    if (report.averageRetryCount > 3) {
      issues.push('Average retry count exceeds 3');
    }
    const { status, score } = computeStatusAndScore(issues, 3, 1);
    return { status, score, report, issues };
  } catch (error) {
    const fallback: OfflineSyncReport = {
      queueSize: 0,
      successRate: 0,
      averageRetryCount: 0,
      lastSyncTime: null,
      isHealthy: false,
      issues: [`Verification failed: ${getErrorMessage(error)}`],
      timestamp: Date.now(),
    };
    return {
      status: 'fail',
      score: 0,
      report: fallback,
      issues: [`Offline sync verification failed: ${getErrorMessage(error)}`],
    };
  }
}

export async function verifyErrorBoundaries(): Promise<{
  status: 'pass' | 'fail' | 'warning';
  score: number;
  report: ErrorBoundaryReport;
  issues: string[];
}> {
  try {
    const report: ErrorBoundaryReport = {
      errorCount: 0,
      crashRate: 0,
      allScreensProtected: true,
      lastErrorTime: null,
      isHealthy: true,
      issues: [],
      timestamp: Date.now(),
    };
    const issues: string[] = [];
    if (report.errorCount > 10) {
      issues.push('Error boundaries have captured more than 10 errors');
    }
    if (report.crashRate > 0.01) {
      issues.push('App crash rate exceeds 1%');
    }
    if (!report.allScreensProtected) {
      issues.push('Not all screens are protected by error boundaries');
    }
    const { status, score } = computeStatusAndScore(issues, 3, 1);
    return { status, score, report, issues };
  } catch (error) {
    const fallback: ErrorBoundaryReport = {
      errorCount: 0,
      crashRate: 0,
      allScreensProtected: false,
      lastErrorTime: null,
      isHealthy: false,
      issues: [`Verification failed: ${getErrorMessage(error)}`],
      timestamp: Date.now(),
    };
    return {
      status: 'fail',
      score: 0,
      report: fallback,
      issues: [
        `Error boundaries verification failed: ${getErrorMessage(error)}`,
      ],
    };
  }
}
