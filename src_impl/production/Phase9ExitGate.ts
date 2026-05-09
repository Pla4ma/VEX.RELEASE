/**
 * PHASE 9 EXIT GATE - Production Hardening Verification
 * 
 * Comprehensive verification system for all production hardening tasks:
 * - Offline sync reliability verification
 * - Error boundaries functionality verification
 * - Accessibility compliance verification
 * - Performance gate verification
 * - Privacy and security verification
 * - Paywall and monetization verification
 * - App Store submission readiness verification
 * 
 * This is the final gate before production deployment.
 */

import { createDebugger } from '../utils/debug';
import { eventBus } from '../events';
import { 
  offlineSyncService, 
  type OfflineSyncReport 
} from '../features/session-completion/offline-sync-service';
import { 
  screenErrorBoundary, 
  type ErrorBoundaryReport 
} from '../errors/ScreenErrorBoundary';
import { 
  accessibilityAudit, 
  type AccessibilityReport 
} from '../accessibility/AccessibilityAudit';
import { 
  performanceGate, 
  type PerformanceReport 
} from '../performance/PerformanceGate';
import { 
  privacyInventory, 
  type PrivacyComplianceReport 
} from '../privacy/PrivacyInventory';
import { 
  paywallVerification, 
  type PaywallVerificationResult 
} from '../monetization/PaywallVerification';
import { 
  appStoreSubmissionPack, 
  type AppStoreSubmissionResult 
} from '../app-store/AppStoreSubmissionPack';

const debug = createDebugger('phase9-exit-gate');

// ============================================================================
// Phase 9 Exit Gate Types
// ============================================================================

export interface Phase9ExitGateResult {
  /** Overall gate status */
  passed: boolean;
  /** Overall score (0-100) */
  score: number;
  /** Detailed verification results */
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
  /** Critical issues blocking deployment */
  blockingIssues: Phase9BlockingIssue[];
  /** Recommendations for production readiness */
  recommendations: string[];
  /** Production deployment readiness */
  deploymentReady: boolean;
  /** Timestamp of verification */
  timestamp: number;
}

export interface Phase9BlockingIssue {
  id: string;
  category: 'offline-sync' | 'error-boundaries' | 'accessibility' | 'performance' | 'privacy' | 'paywall' | 'app-store' | 'general';
  severity: 'critical' | 'major';
  message: string;
  impact: string;
  recommendation: string;
  estimatedFixTime: string;
}

export interface Phase9GateConfig {
  /** Minimum score required for each category */
  minimumScores: {
    offlineSync: number;
    errorBoundaries: number;
    accessibility: number;
    performance: number;
    privacy: number;
    paywall: number;
    appStore: number;
  };
  /** Overall minimum score for gate passage */
  overallMinimumScore: number;
  /** Whether to allow deployment with warnings */
  allowWarnings: boolean;
  /** Required verification categories */
  requiredCategories: Array<keyof Phase9ExitGateResult['results']>;
}

// ============================================================================
// Phase 9 Exit Gate Class
// ============================================================================

export class Phase9ExitGate {
  private static instance: Phase9ExitGate;
  private gateResults: Phase9ExitGateResult[] = [];
  private currentGate: Phase9ExitGateResult | null = null;
  private config: Phase9GateConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeGateResults();
  }

  static getInstance(): Phase9ExitGate {
    if (!Phase9ExitGate.instance) {
      Phase9ExitGate.instance = new Phase9ExitGate();
    }
    return Phase9ExitGate.instance;
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  private getDefaultConfig(): Phase9GateConfig {
    return {
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
  }

  setConfig(config: Partial<Phase9GateConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('Phase 9 Exit Gate configuration updated');
  }

  getConfig(): Phase9GateConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Gate Results Management
  // ============================================================================

  private initializeGateResults(): void {
    this.gateResults = [];
    debug.info('Phase 9 Exit Gate results initialized');
  }

  private addGateResult(result: Phase9ExitGateResult): void {
    this.gateResults.push(result);
    debug.info('Phase 9 Exit Gate result added:', result.passed ? 'PASSED' : 'FAILED');
  }

  private getGateResults(): Phase9ExitGateResult[] {
    return [...this.gateResults];
  }

  private clearGateResults(): void {
    this.gateResults = [];
    debug.info('Phase 9 Exit Gate results cleared');
  }

  // ============================================================================
  // Individual Category Verifications
  // ============================================================================

  private async verifyOfflineSync(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: OfflineSyncReport;
    issues: string[];
  }> {
    debug.info('Verifying offline sync reliability...');

    try {
      const report = await offlineSyncService.generateHealthReport();
      const issues: string[] = [];

      // Check critical metrics
      if (report.queueSize > 100) {
        issues.push('Offline sync queue size exceeds 100 items');
      }

      if (report.successRate < 95) {
        issues.push('Offline sync success rate below 95%');
      }

      if (report.averageRetryCount > 3) {
        issues.push('Average retry count exceeds 3');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = 100;

      if (issues.length > 0) {
        if (report.successRate < 90 || report.queueSize > 200) {
          status = 'fail';
          score = Math.max(0, 100 - (issues.length * 15));
        } else {
          status = 'warning';
          score = Math.max(70, 100 - (issues.length * 10));
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Offline sync verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          queueSize: 0,
          successRate: 0,
          averageRetryCount: 0,
          lastSyncTime: null,
          isHealthy: false,
          issues: [`Verification failed: ${error.message}`],
          timestamp: Date.now(),
        },
        issues: [`Offline sync verification failed: ${error.message}`],
      };
    }
  }

  private async verifyErrorBoundaries(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: ErrorBoundaryReport;
    issues: string[];
  }> {
    debug.info('Verifying error boundaries...');

    try {
      const report = await screenErrorBoundary.generateReport();
      const issues: string[] = [];

      // Check error boundary health
      if (report.errorCount > 10) {
        issues.push('Error boundaries have captured more than 10 errors');
      }

      if (report.crashRate > 0.01) {
        issues.push('App crash rate exceeds 1%');
      }

      if (!report.allScreensProtected) {
        issues.push('Not all screens are protected by error boundaries');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = 100;

      if (issues.length > 0) {
        if (report.crashRate > 0.05 || !report.allScreensProtected) {
          status = 'fail';
          score = Math.max(0, 100 - (issues.length * 20));
        } else {
          status = 'warning';
          score = Math.max(75, 100 - (issues.length * 10));
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Error boundaries verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          errorCount: 0,
          crashRate: 0,
          allScreensProtected: false,
          lastErrorTime: null,
          isHealthy: false,
          issues: [`Verification failed: ${error.message}`],
          timestamp: Date.now(),
        },
        issues: [`Error boundaries verification failed: ${error.message}`],
      };
    }
  }

  private async verifyAccessibility(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: AccessibilityReport;
    issues: string[];
  }> {
    debug.info('Verifying accessibility compliance...');

    try {
      const report = await accessibilityAudit.generateComplianceReport();
      const issues: string[] = [];

      // Check WCAG compliance
      if (report.wcagComplianceLevel !== 'AA') {
        issues.push('App does not meet WCAG 2.1 AA compliance');
      }

      if (report.screenReaderSupport < 90) {
        issues.push('Screen reader support below 90%');
      }

      if (report.keyboardNavigationSupport < 95) {
        issues.push('Keyboard navigation support below 95%');
      }

      if (report.colorContrastIssues > 5) {
        issues.push('More than 5 color contrast issues found');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = 100;

      if (issues.length > 0) {
        if (report.wcagComplianceLevel === 'A' || report.screenReaderSupport < 80) {
          status = 'fail';
          score = Math.max(0, 100 - (issues.length * 15));
        } else {
          status = 'warning';
          score = Math.max(70, 100 - (issues.length * 10));
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Accessibility verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          wcagComplianceLevel: 'A',
          screenReaderSupport: 0,
          keyboardNavigationSupport: 0,
          colorContrastIssues: 0,
          motionReductionSupport: false,
          highContrastSupport: false,
          overallScore: 0,
          issues: [`Verification failed: ${error.message}`],
          timestamp: Date.now(),
        },
        issues: [`Accessibility verification failed: ${error.message}`],
      };
    }
  }

  private async verifyPerformance(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: PerformanceReport;
    issues: string[];
  }> {
    debug.info('Verifying performance metrics...');

    try {
      const report = await performanceGate.generatePerformanceReport();
      const issues: string[] = [];

      // Check performance metrics
      if (report.metrics.appStartupTime > 3000) {
        issues.push('App startup time exceeds 3 seconds');
      }

      if (report.metrics.averageFPS < 55) {
        issues.push('Average FPS below 55');
      }

      if (report.metrics.memoryUsage > 150) {
        issues.push('Memory usage exceeds 150MB');
      }

      if (report.metrics.networkLatency > 1000) {
        issues.push('Network latency exceeds 1 second');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = report.score;

      if (issues.length > 0) {
        if (report.score < 70 || report.metrics.appStartupTime > 5000) {
          status = 'fail';
        } else {
          status = 'warning';
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Performance verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          score: 0,
          metrics: {
            appStartupTime: 0,
            averageFPS: 0,
            memoryUsage: 0,
            networkLatency: 0,
            batteryUsage: 0,
          },
          issues: [`Verification failed: ${error.message}`],
          recommendations: [],
          timestamp: Date.now(),
        },
        issues: [`Performance verification failed: ${error.message}`],
      };
    }
  }

  private async verifyPrivacy(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: PrivacyComplianceReport;
    issues: string[];
  }> {
    debug.info('Verifying privacy and security...');

    try {
      const report = await privacyInventory.generateComplianceReport();
      const issues: string[] = [];

      // Check GDPR compliance
      if (!report.gdprCompliant) {
        issues.push('App is not GDPR compliant');
      }

      if (report.dataPoints.length > 20) {
        issues.push('App collects more than 20 data points');
      }

      if (report.securityVulnerabilities.length > 0) {
        issues.push('Security vulnerabilities detected');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = report.score;

      if (issues.length > 0) {
        if (!report.gdprCompliant || report.securityVulnerabilities.length > 5) {
          status = 'fail';
        } else {
          status = 'warning';
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Privacy verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          gdprCompliant: false,
          dataPoints: [],
          consentRecords: [],
          securityVulnerabilities: [],
          issues: [`Verification failed: ${error.message}`],
          score: 0,
          timestamp: Date.now(),
        },
        issues: [`Privacy verification failed: ${error.message}`],
      };
    }
  }

  private async verifyPaywall(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: PaywallVerificationResult;
    issues: string[];
  }> {
    debug.info('Verifying paywall and monetization...');

    try {
      const report = await paywallVerification.performFullVerification();
      const issues: string[] = [];

      // Check paywall verification results
      if (!report.passed) {
        issues.push('Paywall verification failed');
      }

      if (report.score < 80) {
        issues.push('Paywall verification score below 80');
      }

      if (report.results.productCatalog.issues.length > 0) {
        issues.push('Product catalog has issues');
      }

      if (report.results.purchaseFlow.issues.length > 0) {
        issues.push('Purchase flow has issues');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = report.score;

      if (issues.length > 0) {
        if (!report.passed || report.score < 70) {
          status = 'fail';
        } else {
          status = 'warning';
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('Paywall verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          passed: false,
          score: 0,
          results: {
            productCatalog: { valid: false, issues: [], warnings: [] },
            purchaseFlow: { valid: false, issues: [], warnings: [] },
            subscriptionManagement: { valid: false, issues: [], warnings: [] },
            receiptValidation: { valid: false, issues: [], warnings: [] },
            analyticsIntegration: { valid: false, issues: [], warnings: [] },
            compliance: { gdprCompliant: false, issues: [], warnings: [] },
          },
          issues: [],
          recommendations: [],
          timestamp: Date.now(),
        },
        issues: [`Paywall verification failed: ${error.message}`],
      };
    }
  }

  private async verifyAppStore(): Promise<{
    status: 'pass' | 'fail' | 'warning';
    score: number;
    report: AppStoreSubmissionResult;
    issues: string[];
  }> {
    debug.info('Verifying App Store submission readiness...');

    try {
      const report = await appStoreSubmissionPack.prepareFullSubmissionPack();
      const issues: string[] = [];

      // Check App Store submission results
      if (!report.ready) {
        issues.push('App Store submission not ready');
      }

      if (report.score < 90) {
        issues.push('App Store submission score below 90');
      }

      if (report.results.metadata.issues.length > 0) {
        issues.push('App metadata has issues');
      }

      if (result.results.assets.issues.length > 0) {
        issues.push('App assets have issues');
      }

      // Determine status and score
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let score = report.score;

      if (issues.length > 0) {
        if (!result.ready || report.score < 80) {
          status = 'fail';
        } else {
          status = 'warning';
        }
      }

      return {
        status,
        score,
        report,
        issues,
      };
    } catch (error) {
      debug.error('App Store verification failed:', error);

      return {
        status: 'fail',
        score: 0,
        report: {
          ready: false,
          score: 0,
          results: {
            metadata: { complete: false, issues: [], warnings: [] },
            assets: { complete: false, issues: [], warnings: [] },
            privacy: { complete: false, issues: [], warnings: [] },
            compliance: { complete: false, issues: [], warnings: [] },
            testing: { complete: false, issues: [], warnings: [] },
          },
          materials: {
            metadata: {
              appName: '',
              subtitle: '',
              description: '',
              keywords: [],
              category: '',
              contentRating: '',
              size: '',
              version: '',
              buildNumber: '',
              releaseNotes: '',
            },
            privacyPolicy: { generated: false, content: '', lastUpdated: '' },
            termsOfService: { generated: false, content: '', lastUpdated: '' },
            screenshots: { iPhone: [], iPad: [], AppleTV: [] },
            appIcon: { generated: false, sizes: {} },
            testingAccounts: {
              demo: { username: '', password: '', description: '' },
              premium: { username: '', password: '', description: '' },
            },
            appStoreConnect: {
              appInformation: {},
              pricingAndAvailability: {},
              appReviewInformation: {},
            },
          },
          issues: [],
          recommendations: [],
          timestamp: Date.now(),
        },
        issues: [`App Store verification failed: ${error.message}`],
      };
    }
  }

  // ============================================================================
  // Main Exit Gate Method
  // ============================================================================

  async runExitGate(): Promise<Phase9ExitGateResult> {
    debug.info('Running Phase 9 Exit Gate verification...');

    // Clear previous results
    this.clearGateResults();

    // Run all category verifications
    const [
      offlineSyncResult,
      errorBoundariesResult,
      accessibilityResult,
      performanceResult,
      privacyResult,
      paywallResult,
      appStoreResult,
    ] = await Promise.all([
      this.verifyOfflineSync(),
      this.verifyErrorBoundaries(),
      this.verifyAccessibility(),
      this.verifyPerformance(),
      this.verifyPrivacy(),
      this.verifyPaywall(),
      this.verifyAppStore(),
    ]);

    // Calculate overall results
    const results = {
      offlineSync: offlineSyncResult,
      errorBoundaries: errorBoundariesResult,
      accessibility: accessibilityResult,
      performance: performanceResult,
      privacy: privacyResult,
      paywall: paywallResult,
      appStore: appStoreResult,
    };

    // Calculate overall score
    const categoryScores = Object.values(results).map(result => result.score);
    const overallScore = Math.round(
      categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
    );

    // Identify blocking issues
    const blockingIssues = this.identifyBlockingIssues(results);

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, blockingIssues);

    // Determine deployment readiness
    const deploymentReady = this.isDeploymentReady(results, overallScore, blockingIssues);

    const gateResult: Phase9ExitGateResult = {
      passed: deploymentReady,
      score: overallScore,
      results,
      blockingIssues,
      recommendations,
      deploymentReady,
      timestamp: Date.now(),
    };

    this.addGateResult(gateResult);

    debug.info('Phase 9 Exit Gate completed:', {
      passed: gateResult.passed,
      score: overallScore,
      deploymentReady,
      blockingIssuesCount: blockingIssues.length,
    });

    return gateResult;
  }

  // ============================================================================
  // Blocking Issues Identification
  // ============================================================================

  private identifyBlockingIssues(results: Phase9ExitGateResult['results']): Phase9BlockingIssue[] {
    const blockingIssues: Phase9BlockingIssue[] = [];

    // Check each category for blocking issues
    for (const [category, result] of Object.entries(results)) {
      if (result.status === 'fail') {
        blockingIssues.push({
          id: `${category}-critical-failure`,
          category: category as Phase9BlockingIssue['category'],
          severity: 'critical',
          message: `${category} verification failed critically`,
          impact: 'Blocks production deployment',
          recommendation: `Fix all ${category} issues before deployment`,
          estimatedFixTime: '2-4 hours',
        });
      }

      // Check score against minimum requirements
      const minimumScore = this.config.minimumScores[category as keyof typeof this.config.minimumScores];
      if (result.score < minimumScore) {
        blockingIssues.push({
          id: `${category}-score-below-minimum`,
          category: category as Phase9BlockingIssue['category'],
          severity: 'major',
          message: `${category} score (${result.score}) below minimum (${minimumScore})`,
          impact: 'Reduces deployment confidence',
          recommendation: `Improve ${category} to meet minimum score requirements`,
          estimatedFixTime: '1-2 hours',
        });
      }
    }

    return blockingIssues;
  }

  // ============================================================================
  // Deployment Readiness Check
  // ============================================================================

  private isDeploymentReady(
    results: Phase9ExitGateResult['results'],
    overallScore: number,
    blockingIssues: Phase9BlockingIssue[]
  ): boolean {
    // Check overall score
    if (overallScore < this.config.overallMinimumScore) {
      return false;
    }

    // Check for critical blocking issues
    const criticalIssues = blockingIssues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      return false;
    }

    // Check required categories
    for (const category of this.config.requiredCategories) {
      if (results[category].status === 'fail') {
        return false;
      }
    }

    // Check if warnings are allowed
    if (!this.config.allowWarnings) {
      const failedCategories = Object.entries(results)
        .filter(([_, result]) => result.status !== 'pass')
        .map(([category]) => category);
      
      if (failedCategories.length > 0) {
        return false;
      }
    }

    return true;
  }

  // ============================================================================
  // Recommendations Generation
  // ============================================================================

  private generateRecommendations(
    results: Phase9ExitGateResult['results'],
    blockingIssues: Phase9BlockingIssue[]
  ): string[] {
    const recommendations: string[] = [];

    // Generate category-specific recommendations
    for (const [category, result] of Object.entries(results)) {
      if (result.status === 'fail') {
        recommendations.push(`URGENT: Fix critical ${category} issues before deployment`);
      } else if (result.status === 'warning') {
        recommendations.push(`Review and address ${category} warnings`);
      }

      if (result.score < 85) {
        recommendations.push(`Improve ${category} score from ${result.score} to 85+`);
      }
    }

    // Generate blocking issue recommendations
    for (const issue of blockingIssues) {
      recommendations.push(issue.recommendation);
    }

    // General recommendations
    if (blockingIssues.length === 0) {
      recommendations.push('All systems ready for production deployment');
      recommendations.push('Proceed with final deployment checklist');
    } else {
      recommendations.push('Address all blocking issues before deployment');
      recommendations.push('Re-run exit gate after fixing issues');
    }

    return recommendations;
  }

  // ============================================================================
  // Export Singleton Instance
  // ============================================================================

  export const phase9ExitGate = Phase9ExitGate.getInstance();
}