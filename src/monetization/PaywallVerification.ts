/**
 * Paywall and Monetization Verification
 *
 * Comprehensive verification system for RevenueCat integration.
 */

import { createDebugger } from '../utils/debug';
import { verifyProductCatalog } from './paywall-verification-catalog';
import {
  verifyPurchaseFlow,
  verifySubscriptionManagement,
} from './paywall-verification-purchase';
import {
  verifyReceiptValidation,
  verifyAnalyticsIntegration,
  verifyCompliance,
} from './paywall-verification-receipt';
import type {
  PaywallVerificationResult,
  PaywallIssue,
  ValidationSection,
  ComplianceSection,
} from './paywall-verification-types';

export type {
  PaywallVerificationResult,
  PaywallIssue,
  ValidationSection,
  ComplianceSection,
};

const debug = createDebugger('paywall-verification');

export class PaywallVerification {
  private static instance: PaywallVerification;
  private verificationResults: PaywallVerificationResult[] = [];

  private constructor() {
    this.verificationResults = [];
  }

  static getInstance(): PaywallVerification {
    if (!PaywallVerification.instance) {
      PaywallVerification.instance = new PaywallVerification();
    }
    return PaywallVerification.instance;
  }

  private addVerificationResult(result: PaywallVerificationResult): void {
    this.verificationResults.push(result);
    debug.info(
      'Paywall verification result added:',
      result.passed ? 'PASSED' : 'FAILED',
    );
  }

  async performFullVerification(): Promise<PaywallVerificationResult> {
    debug.info('Performing full paywall and monetization verification...');

    const [
      productCatalogResult,
      purchaseFlowResult,
      subscriptionManagementResult,
      receiptValidationResult,
      analyticsIntegrationResult,
      complianceResult,
    ] = await Promise.all([
      verifyProductCatalog(),
      verifyPurchaseFlow(),
      verifySubscriptionManagement(),
      verifyReceiptValidation(),
      verifyAnalyticsIntegration(),
      verifyCompliance(),
    ]);

    const allIssues = [
      ...productCatalogResult.issues,
      ...purchaseFlowResult.issues,
      ...subscriptionManagementResult.issues,
      ...receiptValidationResult.issues,
      ...analyticsIntegrationResult.issues,
      ...complianceResult.issues,
    ];

    const _allWarnings = [
      ...productCatalogResult.warnings,
      ...purchaseFlowResult.warnings,
      ...subscriptionManagementResult.warnings,
      ...receiptValidationResult.warnings,
      ...analyticsIntegrationResult.warnings,
      ...complianceResult.warnings,
    ];

    const score = Math.max(0, 100 - allIssues.length * 10);
    const passed = score >= 80;

    const result: PaywallVerificationResult = {
      passed,
      score,
      results: {
        productCatalog: productCatalogResult,
        purchaseFlow: purchaseFlowResult,
        subscriptionManagement: subscriptionManagementResult,
        receiptValidation: receiptValidationResult,
        analyticsIntegration: analyticsIntegrationResult,
        compliance: complianceResult,
      },
      issues: allIssues.map((issue, index) => ({
        id: `paywall-${index}`,
        category: 'general' as const,
        severity: 'moderate' as const,
        message: issue,
        recommendation: 'Review and fix paywall issues',
      })),
      recommendations: generateRecommendations(allIssues),
      timestamp: Date.now(),
    };

    this.addVerificationResult(result);

    debug.info('Full verification completed:', {
      passed,
      score,
      issuesCount: allIssues.length,
    });

    return result;
  }
}

function generateRecommendations(issues: string[]): string[] {
  const recommendations: string[] = [];

  if (issues.some((issue) => issue.includes('catalog'))) {
    recommendations.push(
      'Review product catalog structure and ensure all required fields are present',
    );
    recommendations.push('Validate all product metadata before publishing');
  }

  if (issues.some((issue) => issue.includes('purchase'))) {
    recommendations.push(
      'Test purchase flow thoroughly with various scenarios',
    );
    recommendations.push('Ensure proper error handling and user feedback');
  }

  if (issues.some((issue) => issue.includes('subscription'))) {
    recommendations.push(
      'Review subscription pricing and ensure clear terms of service',
    );
    recommendations.push('Test subscription cancellation and renewal flows');
  }

  if (issues.some((issue) => issue.includes('receipt'))) {
    recommendations.push(
      'Implement proper receipt validation and server-side verification',
    );
    recommendations.push('Test receipt restoration and edge cases');
  }

  if (issues.some((issue) => issue.includes('analytics'))) {
    recommendations.push('Ensure all purchase events are properly tracked');
    recommendations.push('Test analytics integration with real user scenarios');
  }

  if (issues.some((issue) => issue.includes('compliance'))) {
    recommendations.push('Review GDPR compliance measures and data handling');
    recommendations.push(
      'Conduct privacy impact assessment and update policies',
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring and regular security audits');
  }

  return recommendations;
}

export const paywallVerification = PaywallVerification.getInstance();
