/**
 * Integration-level setup helpers for ExitGate tests.
 * Wires up all seven verifiers at once via reusable functions.
 */

import {
  greenOfflineSyncReport,
  greenErrorBoundaryReport,
  greenAccessibilityReport,
  greenPerformanceReport,
  greenPrivacyReport,
  criticalOfflineSyncReport,
  criticalErrorBoundaryReport,
  criticalAccessibilityReport,
  criticalPerformanceReport,
  criticalPrivacyReport,
  moderateOfflineSyncReport,
  moderateErrorBoundaryReport,
  moderateAccessibilityReport,
  moderatePerformanceReport,
  moderatePrivacyReport,
} from './ExitGate.test-helpers';
import {
  greenPaywallResult,
  criticalPaywallResult,
  moderatePaywallResult,
  greenAppStoreResult,
  criticalAppStoreResult,
  moderateAppStoreResult,
} from './ExitGate.test-helpers.monetization';

export interface ExitGateMocks {
  offlineSyncService: { generateHealthReport: jest.Mock };
  screenErrorBoundary: { generateReport: jest.Mock };
  accessibilityAudit: { generateComplianceReport: jest.Mock };
  performanceGate: { generatePerformanceReport: jest.Mock };
  privacyInventory: { generateComplianceReport: jest.Mock };
  paywallVerification: { performFullVerification: jest.Mock };
  appStoreSubmissionPack: { prepareFullSubmissionPack: jest.Mock };
}

export function setupGreenMocks(m: ExitGateMocks): void {
  m.offlineSyncService.generateHealthReport.mockResolvedValue(greenOfflineSyncReport);
  m.screenErrorBoundary.generateReport.mockResolvedValue(greenErrorBoundaryReport);
  m.accessibilityAudit.generateComplianceReport.mockResolvedValue(greenAccessibilityReport);
  m.performanceGate.generatePerformanceReport.mockResolvedValue(greenPerformanceReport);
  m.privacyInventory.generateComplianceReport.mockResolvedValue(greenPrivacyReport);
  m.paywallVerification.performFullVerification.mockResolvedValue(greenPaywallResult);
  m.appStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(greenAppStoreResult);
}

export function setupCriticalMocks(m: ExitGateMocks): void {
  m.offlineSyncService.generateHealthReport.mockResolvedValue(criticalOfflineSyncReport);
  m.screenErrorBoundary.generateReport.mockResolvedValue(criticalErrorBoundaryReport);
  m.accessibilityAudit.generateComplianceReport.mockResolvedValue(criticalAccessibilityReport);
  m.performanceGate.generatePerformanceReport.mockResolvedValue(criticalPerformanceReport);
  m.privacyInventory.generateComplianceReport.mockResolvedValue(criticalPrivacyReport);
  m.paywallVerification.performFullVerification.mockResolvedValue(criticalPaywallResult);
  m.appStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(criticalAppStoreResult);
}

export function setupModerateMocks(m: ExitGateMocks): void {
  m.offlineSyncService.generateHealthReport.mockResolvedValue(moderateOfflineSyncReport);
  m.screenErrorBoundary.generateReport.mockResolvedValue(moderateErrorBoundaryReport);
  m.accessibilityAudit.generateComplianceReport.mockResolvedValue(moderateAccessibilityReport);
  m.performanceGate.generatePerformanceReport.mockResolvedValue(moderatePerformanceReport);
  m.privacyInventory.generateComplianceReport.mockResolvedValue(moderatePrivacyReport);
  m.paywallVerification.performFullVerification.mockResolvedValue(moderatePaywallResult);
  m.appStoreSubmissionPack.prepareFullSubmissionPack.mockResolvedValue(moderateAppStoreResult);
}
