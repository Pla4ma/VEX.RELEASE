/**
 * Mock data for individual ExitGate verifiers:
 * offline-sync, error-boundaries, accessibility, performance, privacy.
 */

// ---------------------------------------------------------------------------
// Offline Sync
// ---------------------------------------------------------------------------

export const greenOfflineSyncReport = {
  queueSize: 10,
  successRate: 98,
  averageRetryCount: 1.5,
  lastSyncTime: new Date().toISOString(),
  isHealthy: true,
  issues: [],
  timestamp: Date.now(),
};

export const moderateOfflineSyncReport = {
  queueSize: 50,
  successRate: 92,
  averageRetryCount: 2.5,
  lastSyncTime: new Date().toISOString(),
  isHealthy: true,
  issues: [],
  timestamp: Date.now(),
};

export const criticalOfflineSyncReport = {
  queueSize: 250,
  successRate: 85,
  averageRetryCount: 4,
  lastSyncTime: new Date().toISOString(),
  isHealthy: false,
  issues: ["Critical sync issues"],
  timestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// Error Boundaries
// ---------------------------------------------------------------------------

export const greenErrorBoundaryReport = {
  errorCount: 3,
  crashRate: 0.005,
  allScreensProtected: true,
  lastErrorTime: new Date().toISOString(),
  isHealthy: true,
  issues: [],
  timestamp: Date.now(),
};

export const moderateErrorBoundaryReport = {
  errorCount: 15,
  crashRate: 0.02,
  allScreensProtected: true,
  lastErrorTime: new Date().toISOString(),
  isHealthy: true,
  issues: [],
  timestamp: Date.now(),
};

export const criticalErrorBoundaryReport = {
  errorCount: 25,
  crashRate: 0.08,
  allScreensProtected: false,
  lastErrorTime: new Date().toISOString(),
  isHealthy: false,
  issues: ["Critical error boundary issues"],
  timestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const greenAccessibilityReport = {
  wcagComplianceLevel: "AA" as const,
  screenReaderSupport: 95,
  keyboardNavigationSupport: 98,
  colorContrastIssues: 2,
  motionReductionSupport: true,
  highContrastSupport: true,
  overallScore: 95,
  issues: [],
  timestamp: Date.now(),
};

export const moderateAccessibilityReport = {
  wcagComplianceLevel: "AA" as const,
  screenReaderSupport: 88,
  keyboardNavigationSupport: 92,
  colorContrastIssues: 8,
  motionReductionSupport: true,
  highContrastSupport: false,
  overallScore: 82,
  issues: [],
  timestamp: Date.now(),
};

export const criticalAccessibilityReport = {
  wcagComplianceLevel: "A" as const,
  screenReaderSupport: 75,
  keyboardNavigationSupport: 80,
  colorContrastIssues: 15,
  motionReductionSupport: false,
  highContrastSupport: false,
  overallScore: 65,
  issues: ["Critical accessibility issues"],
  timestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

export const greenPerformanceReport = {
  score: 92,
  metrics: {
    appStartupTime: 2000,
    averageFPS: 58,
    memoryUsage: 120,
    networkLatency: 500,
    batteryUsage: 15,
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const moderatePerformanceReport = {
  score: 78,
  metrics: {
    appStartupTime: 3500,
    averageFPS: 52,
    memoryUsage: 140,
    networkLatency: 1200,
    batteryUsage: 25,
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

export const criticalPerformanceReport = {
  score: 65,
  metrics: {
    appStartupTime: 6000,
    averageFPS: 45,
    memoryUsage: 180,
    networkLatency: 2000,
    batteryUsage: 40,
  },
  issues: [],
  recommendations: [],
  timestamp: Date.now(),
};

// ---------------------------------------------------------------------------
// Privacy
// ---------------------------------------------------------------------------

export const greenPrivacyReport = {
  gdprCompliant: true,
  dataPoints: [
    { id: "email", category: "personal", purpose: "authentication", retention: "365 days" },
    { id: "usage", category: "analytics", purpose: "improvement", retention: "90 days" },
  ],
  consentRecords: [{ id: "analytics", granted: true, timestamp: new Date().toISOString() }],
  securityVulnerabilities: [],
  issues: [],
  score: 98,
  timestamp: Date.now(),
};

export const moderatePrivacyReport = {
  gdprCompliant: true,
  dataPoints: Array(25).fill({
    id: "test",
    category: "analytics",
    purpose: "test",
    retention: "30 days",
  }),
  consentRecords: [{ id: "analytics", granted: true, timestamp: new Date().toISOString() }],
  securityVulnerabilities: [{ id: "minor", severity: "low", description: "Minor security issue" }],
  issues: [],
  score: 82,
  timestamp: Date.now(),
};

export const criticalPrivacyReport = {
  gdprCompliant: false,
  dataPoints: [],
  consentRecords: [],
  securityVulnerabilities: [{ id: "critical", severity: "high", description: "Critical security issue" }],
  issues: ["GDPR compliance issues"],
  score: 45,
  timestamp: Date.now(),
};
