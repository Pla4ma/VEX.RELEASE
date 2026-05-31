/**
 * Phase 9 Exit Gate Types
 */

export interface ErrorBoundaryReport {
  errorCount: number;
  crashRate: number;
  allScreensProtected: boolean;
  lastErrorTime: number | null;
  isHealthy: boolean;
  issues: string[];
  timestamp: number;
}

export interface AccessibilityReport {
  wcagComplianceLevel: 'A' | 'AA' | 'AAA';
  screenReaderSupport: number;
  keyboardNavigationSupport: number;
  colorContrastIssues: number;
  motionReductionSupport: boolean;
  highContrastSupport: boolean;
  overallScore: number;
  issues: string[];
  timestamp: number;
}

export interface PerformanceReport {
  score: number;
  metrics: {
    appStartupTime: number;
    averageFPS: number;
    memoryUsage: number;
    networkLatency: number;
    batteryUsage: number;
  };
  issues: string[];
  recommendations: string[];
  timestamp: number;
}

export interface PrivacyComplianceReport {
  gdprCompliant: boolean;
  dataPoints: string[];
  consentRecords: string[];
  securityVulnerabilities: string[];
  issues: string[];
  score: number;
  timestamp: number;
}

export interface AppStoreSubmissionResult {
  ready: boolean;
  score: number;
  results: {
    metadata: { complete: boolean; issues: string[]; warnings: string[] };
    assets: { complete: boolean; issues: string[]; warnings: string[] };
    privacy: { complete: boolean; issues: string[]; warnings: string[] };
    compliance: { complete: boolean; issues: string[]; warnings: string[] };
    testing: { complete: boolean; issues: string[]; warnings: string[] };
  };
  materials: {
    metadata: {
      appName: string;
      subtitle: string;
      description: string;
      keywords: string[];
      category: string;
      contentRating: string;
      size: string;
      version: string;
      buildNumber: string;
      releaseNotes: string;
    };
    privacyPolicy: { generated: boolean; content: string; lastUpdated: string };
    termsOfService: {
      generated: boolean;
      content: string;
      lastUpdated: string;
    };
    screenshots: { iPhone: string[]; iPad: string[]; AppleTV: string[] };
    appIcon: { generated: boolean; sizes: Record<string, string> };
    testingAccounts: {
      demo: { username: string; password: string; description: string };
      premium: { username: string; password: string; description: string };
    };
    appStoreConnect: {
      appInformation: Record<string, unknown>;
      pricingAndAvailability: Record<string, unknown>;
      appReviewInformation: Record<string, unknown>;
    };
  };
  issues: string[];
  recommendations: string[];
  timestamp: number;
}
