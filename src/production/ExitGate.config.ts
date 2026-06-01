/**
 * Phase 9 Exit Gate - Result, Blocking Issue, and Config types
 */

import type { OfflineSyncReport } from '../features/session-completion/offline-sync-service';
import type { PaywallVerificationResult } from '../monetization/PaywallVerification';
import type {
  ErrorBoundaryReport,
  AccessibilityReport,
  PerformanceReport,
  PrivacyComplianceReport,
  AppStoreSubmissionResult,
} from './ExitGate.types';

export interface Phase9ExitGateResult {
  passed: boolean;
  score: number;
  results: {
    offlineSync: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: OfflineSyncReport;
      issues: string[];
    };
    errorBoundaries: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: ErrorBoundaryReport;
      issues: string[];
    };
    accessibility: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: AccessibilityReport;
      issues: string[];
    };
    performance: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: PerformanceReport;
      issues: string[];
    };
    privacy: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: PrivacyComplianceReport;
      issues: string[];
    };
    paywall: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: PaywallVerificationResult;
      issues: string[];
    };
    appStore: {
      status: 'pass' | 'fail' | 'warning';
      score: number;
      report: AppStoreSubmissionResult;
      issues: string[];
    };
  };
  blockingIssues: Phase9BlockingIssue[];
  recommendations: string[];
  deploymentReady: boolean;
  timestamp: number;
}

export interface Phase9BlockingIssue {
  id: string;
  category:
    | 'offline-sync'
    | 'error-boundaries'
    | 'accessibility'
    | 'performance'
    | 'privacy'
    | 'paywall'
    | 'app-store'
    | 'general';
  severity: 'critical' | 'major';
  message: string;
  impact: string;
  recommendation: string;
  estimatedFixTime: string;
}

export interface Phase9GateConfig {
  minimumScores: {
    offlineSync: number;
    errorBoundaries: number;
    accessibility: number;
    performance: number;
    privacy: number;
    paywall: number;
    appStore: number;
  };
  overallMinimumScore: number;
  allowWarnings: boolean;
  requiredCategories: Array<keyof Phase9ExitGateResult['results']>;
}

export const DEFAULT_GATE_CONFIG: Phase9GateConfig = {
  minimumScores: {
    offlineSync: 85,
    errorBoundaries: 90,
    accessibility: 85,
    performance: 80,
    privacy: 95,
    paywall: 85,
    appStore: 90,
  },
  overallMinimumScore: 85,
  allowWarnings: false,
  requiredCategories: [
    'offlineSync',
    'errorBoundaries',
    'accessibility',
    'performance',
    'privacy',
    'paywall',
    'appStore',
  ],
};
