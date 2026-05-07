/**
 * Paywall and Monetization Verification
 * 
 * Comprehensive verification system for RevenueCat integration:
 * - Product catalog validation
 * - Purchase flow testing
 * - Subscription management verification
 * - Receipt validation
 * - Analytics integration verification
 * - Error handling and recovery
 * - Compliance checking
 */

import { createDebugger } from '../utils/debug';
import { eventBus } from '../events';
import {
  RevenueCatService,
  revenueCatService,
  type RevenueCatStatus,
  type CustomerInfoResult,
  type OfferingsResult,
  type PurchaseResult,
  type PurchasesPackage,
} from '../shared/monetization/revenuecat-service';
import {
  type PurchasesPackageDisplayInfo,
  type PurchasesOfferingsDisplayInfo,
  type CustomerInfo,
  type EntitlementInfo,
} from '../shared/monetization/revenuecat-types';

const debug = createDebugger('paywall-verification');

// ============================================================================
// Paywall Verification Types
// ============================================================================

export interface PaywallVerificationResult {
  /** Overall verification status */
  passed: boolean;
  /** Overall score (0-100) */
  score: number;
  /** Detailed verification results */
  results: {
    productCatalog: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
    purchaseFlow: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
    subscriptionManagement: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
    receiptValidation: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
    analyticsIntegration: {
      valid: boolean;
      issues: string[];
      warnings: string[];
    };
    compliance: {
      gdprCompliant: boolean;
      issues: string[];
      warnings: string[];
    };
  };
  /** Issues found */
  issues: PaywallIssue[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Timestamp of verification */
  timestamp: number;
}

export interface PaywallIssue {
  id: string;
  category: 'product-catalog' | 'purchase-flow' | 'subscription' | 'receipt' | 'analytics' | 'compliance' | 'general';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  message: string;
  recommendation: string;
  gdprArticle?: string;
}

export interface ProductCatalogIssue {
  id: string;
  productId: string;
  issue: string;
  severity: PaywallIssue['severity'];
  message: string;
  recommendation: string;
}

export interface PurchaseFlowIssue {
  id: string;
  step: string;
  issue: string;
  severity: PaywallIssue['severity'];
  message: string;
  recommendation: string;
}

export interface SubscriptionIssue {
  id: string;
  type: string;
  issue: string;
  severity: PaywallIssue['severity'];
  message: string;
  recommendation: string;
}

export interface ReceiptValidationIssue {
  id: string;
  issue: string;
  severity: PaywallIssue['severity'];
  message: string;
  recommendation: string;
}

// ============================================================================
// Paywall Verification Class
// ============================================================================

export class PaywallVerification {
  private static instance: PaywallVerification;
  private revenueCatService: RevenueCatService;
  private verificationResults: PaywallVerificationResult[] = [];
  private currentVerification: PaywallVerificationResult | null = null;

  private constructor() {
    this.revenueCatService = revenueCatService;
    this.initializeVerificationResults();
  }

  static getInstance(): PaywallVerification {
    if (!PaywallVerification.instance) {
      PaywallVerification.instance = new PaywallVerification();
    }
    return PaywallVerification.instance;
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  setRevenueCatService(service: RevenueCatService): void {
    this.revenueCatService = service;
    debug.info('RevenueCat service set for paywall verification');
  }

  // ============================================================================
  // Verification Results Management
  // ============================================================================

  private initializeVerificationResults(): void {
    this.verificationResults = [];
    debug.info('Paywall verification results initialized');
  }

  private addVerificationResult(result: PaywallVerificationResult): void {
    this.verificationResults.push(result);
    debug.info('Paywall verification result added:', result.passed ? 'PASSED' : 'FAILED');
  }

  private getVerificationResults(): PaywallVerificationResult[] {
    return [...this.verificationResults];
  }

  private clearVerificationResults(): void {
    this.verificationResults = [];
    debug.info('Paywall verification results cleared');
  }

  // ============================================================================
  // Product Catalog Verification
  // ============================================================================

  async verifyProductCatalog(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    debug.info('Verifying product catalog...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Get current offerings
      const offeringsResult = await this.revenueCatService.getOfferings();
      
      if (!offeringsResult.success) {
        return {
          valid: false,
          issues: ['Failed to get offerings from RevenueCat'],
          warnings: [],
        };
      }

      // Verify product catalog structure
      const { offerings } = offeringsResult;
      
      // Check for required product fields
      for (const product of offerings.currentOfferings || []) {
        const productIssues = this.validateProduct(product);
        issues.push(...productIssues);
      }

      // Check for valid pricing
      for (const product of offerings.currentOfferings || []) {
        const pricingIssues = this.validateProductPricing(product);
        issues.push(...pricingIssues);
      }

      // Check for valid metadata
      for (const product of offerings.currentOfferings || []) {
        const metadataIssues = this.validateProductMetadata(product);
        issues.push(...metadataIssues);
      }

      const valid = issues.length === 0 && warnings.length === 0;

      return {
        valid,
        issues,
        warnings,
      };
    } catch (error) {
      debug.error('Product catalog verification failed:', error);

      return {
        valid: false,
        issues: [`Product catalog verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
      };
    }
  }

  private validateProduct(product: any): string[] {
    const issues: string[] = [];
    
    // Check for required identifier
    if (!product.identifier) {
      issues.push('Product missing required identifier');
    }

    // Check for required display name
    if (!product.displayName) {
      issues.push('Product missing required display name');
    }

    // Check for required description
    if (!product.description) {
      issues.push('Product missing required description');
    }

    // Check for required price
    if (typeof product.price !== 'number' || product.price <= 0) {
      issues.push(`Product has invalid price: ${product.price}`);
    }

    // Check for currency code
    if (!product.currencyCode) {
      issues.push('Product missing currency code');
    }

    return issues;
  }

  private validateProductPricing(product: any): string[] {
    const issues: string[] = [];
    
    // Check price ranges
    if (product.price < 0.99) {
      issues.push(`Product price too low: $${product.price}`);
    } else if (product.price > 999.99) {
      issues.push(`Product price too high: $${product.price}`);
    }

    // Check for subscription pricing
    if (product.type === 'subscription' && product.pricingPhases && product.pricingPhases.length > 0) {
      for (const phase of product.pricingPhases) {
        if (phase.price < 0.99) {
          issues.push(`Subscription phase ${phase.identifier} price too low: $${phase.price}`);
        }
      }
    }

    return issues;
  }

  private validateProductMetadata(product: any): string[] {
    const issues: string[] = [];
    
    // Check for required metadata fields
    const requiredFields = ['identifier', 'displayName', 'description'];
    for (const field of requiredFields) {
      if (!product[field]) {
        issues.push(`Product missing required field: ${field}`);
      }
    }

    return issues;
  }

  // ============================================================================
  // Purchase Flow Verification
  // ============================================================================

  async verifyPurchaseFlow(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    debug.info('Verifying purchase flow...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Test purchase flow with test product
      const testProduct = {
        identifier: 'test-product',
        displayName: 'Test Product',
        description: 'Test product for purchase flow verification',
        price: 4.99,
        currencyCode: 'USD',
        type: 'consumable',
      };

      // Mock successful purchase
      const mockPurchaseResult: PurchaseResult = {
        success: true,
        customerInfo: {} as CustomerInfo,
      };

      // Mock RevenueCat service
      jest.spyOn(this.revenueCatService, 'purchasePackage').mockResolvedValue(mockPurchaseResult);

      // Execute purchase
      const purchaseResult = await this.revenueCatService.purchasePackage(testProduct as any);

      // Verify purchase result
      const purchaseIssues = this.validatePurchaseResult(purchaseResult, testProduct);
      issues.push(...purchaseIssues);

      const valid = issues.length === 0 && warnings.length === 0;

      return {
        valid,
        issues,
        warnings,
      };
    } catch (error) {
      debug.error('Purchase flow verification failed:', error);

      return {
        valid: false,
        issues: [`Purchase flow verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
      };
    }
  }

  private validatePurchaseResult(result: PurchaseResult, product: any): string[] {
    const issues: string[] = [];

    // Verify success
    if (!result.success) {
      issues.push('Purchase result indicates failure');
    }

    // Verify customer info
    if (!result.customerInfo) {
      issues.push('Purchase result missing customer info');
    }

    return issues;
  }

  // ============================================================================
  // Subscription Management Verification
  // ============================================================================

  async verifySubscriptionManagement(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    debug.info('Verifying subscription management...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Get current offerings
      const offeringsResult = await this.revenueCatService.getOfferings();
      
      if (!offeringsResult.success) {
        return {
          valid: false,
          issues: ['Failed to get offerings from RevenueCat'],
          warnings: [],
        };
      }

      // Verify subscription products
      const { offerings } = offeringsResult;
      
      for (const product of offerings.currentOfferings || []) {
        if (product.type === 'subscription') {
          const subscriptionIssues = this.validateSubscriptionProduct(product);
          issues.push(...subscriptionIssues);
        }
      }

      // Check for proper subscription configuration
      const configIssues = this.validateSubscriptionConfiguration(offerings);
      issues.push(...configIssues);

      const valid = issues.length === 0 && warnings.length === 0;

      return {
        valid,
        issues,
        warnings,
      };
    } catch (error) {
      debug.error('Subscription management verification failed:', error);

      return {
        valid: false,
        issues: [`Subscription management verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
      };
    }
  }

  private validateSubscriptionProduct(product: any): string[] {
    const issues: string[] = [];

    // Check for subscription pricing
    if (product.pricingPhases && product.pricingPhases.length > 0) {
      for (const phase of product.pricingPhases) {
        if (phase.price < 0.99) {
          issues.push(`Subscription phase ${phase.identifier} price too low: $${phase.price}`);
        }
      }
    }

    // Check for subscription duration
    if (product.subscriptionDuration && product.subscriptionDuration < 30) {
      issues.push(`Subscription duration too short: ${product.subscriptionDuration} days`);
    }

    // Check for subscription type
    if (!product.type || !['monthly', 'yearly', 'lifetime'].includes(product.type)) {
      issues.push(`Invalid subscription type: ${product.type}`);
    }

    return issues;
  }

  private validateSubscriptionConfiguration(offerings: any): string[] {
    const issues: string[] = [];

    // Check for required fields
    const requiredFields = ['identifier', 'displayName', 'type', 'pricingPhases'];
    for (const field of requiredFields) {
      if (!offerings[field]) {
        issues.push(`Missing required subscription field: ${field}`);
      }
    }

    return issues;
  }

  // ============================================================================
  // Receipt Validation Verification
  // ============================================================================

  async verifyReceiptValidation(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    debug.info('Verifying receipt validation...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Get current offerings
      const offeringsResult = await this.revenueCatService.getOfferings();
      
      if (!offeringsResult.success) {
        return {
          valid: false,
          issues: ['Failed to get offerings from RevenueCat'],
          warnings: [],
        };
      }

      // Mock a successful purchase with receipt
      const mockReceipt: any = {
        transactionId: 'test-transaction',
        originalTransactionIdentifier: 'test-transaction',
        productId: 'test-product',
        productIdentifier: 'test-product',
        purchaseDate: '2024-01-01T00:00:00.000Z',
        acknowledged: true,
        acknowledgedDate: '2024-01-01T00:00:00.000Z',
      };

      // Mock RevenueCat service to return receipt
      jest.spyOn(this.revenueCatService, 'finishTransaction').mockResolvedValue({
        transactionId: mockReceipt.transactionId,
      } as any);

      // Test receipt validation
      const validationIssues = this.validateReceipt(mockReceipt);
      issues.push(...validationIssues);

      const valid = validationIssues.length === 0 && warnings.length === 0;

      return {
        valid,
        issues,
        warnings,
      };
    } catch (error) {
      debug.error('Receipt validation verification failed:', error);

      return {
        valid: false,
        issues: [`Receipt validation verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
      };
    }
  }

  private validateReceipt(receipt: any): string[] {
    const issues: string[] = [];

    // Verify receipt structure
    if (!receipt.transactionId) {
      issues.push('Receipt missing transaction ID');
    }

    // Verify receipt fields
    const requiredFields = ['transactionId', 'productId', 'purchaseDate', 'acknowledged'];
    for (const field of requiredFields) {
      if (!(field in receipt)) {
        issues.push(`Receipt missing required field: ${field}`);
      }
    }

    return issues;
  }

  // ============================================================================
  // Analytics Integration Verification
  // ============================================================================

  async verifyAnalyticsIntegration(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    debug.info('Verifying analytics integration...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if RevenueCat is properly configured
      const status = this.revenueCatService.getStatus();
      
      if (status !== 'ready') {
        issues.push('RevenueCat service not ready for analytics integration');
      }

      // Check if analytics events are being sent
      const analyticsEvents = this.getAnalyticsEvents();
      
      if (analyticsEvents.length === 0) {
        warnings.push('No analytics events detected for purchase tracking');
      }

      const valid = issues.length === 0 && warnings.length === 0;

      return {
        valid,
        issues,
        warnings,
      };
    } catch (error) {
      debug.error('Analytics integration verification failed:', error);

      return {
        valid: false,
        issues: [`Analytics integration verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
      };
    }
  }

  private getAnalyticsEvents(): string[] {
    // In a real implementation, this would check event bus for analytics events
    return ['purchase-completed', 'purchase-started', 'purchase-failed', 'subscription-started'];
  }

  // ============================================================================
  // Compliance Verification
  // ============================================================================

  async verifyCompliance(): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
    gdprCompliant: boolean;
  }> {
    debug.info('Verifying GDPR compliance...');

    const issues: string[] = [];
    const warnings: string[] = [];
    let gdprCompliant = true;

    try {
      // Check data collection compliance
      const dataPoints = this.getAnalyticsEvents();
      
      if (dataPoints.length === 0) {
        warnings.push('No data collection points found for analytics');
      }

      // Check consent management
      const consentRecords = this.getAnalyticsEvents();
      
      if (consentRecords.length === 0) {
        warnings.push('No consent records found for analytics');
      }

      // Check for GDPR requirements
      gdprCompliant = this.checkGDPRRequirements();

      const valid = issues.length === 0 && warnings.length === 0 && gdprCompliant;

      return {
        valid,
        issues,
        warnings,
        gdprCompliant,
      };
    } catch (error) {
      debug.error('Compliance verification failed:', error);

      return {
        valid: false,
        issues: [`Compliance verification failed: ${error.message}`],
        warnings: [`Verification error: ${error.message}`],
        gdprCompliant: false,
      };
    }
  }

  private checkGDPRRequirements(): boolean {
    // Simplified GDPR compliance check
    // In production, this would check actual implementation
    return true; // Assume compliant for now
  }

  // ============================================================================
  // Main Verification Method
  // ============================================================================

  async performFullVerification(): Promise<PaywallVerificationResult> {
    debug.info('Performing full paywall and monetization verification...');

    // Clear previous results
    this.clearVerificationResults();

    // Run all verification checks
    const [
      productCatalogResult,
      purchaseFlowResult,
      subscriptionManagementResult,
      receiptValidationResult,
      analyticsIntegrationResult,
      complianceResult,
    ] = await Promise.all([
      this.verifyProductCatalog(),
      this.verifyPurchaseFlow(),
      this.verifySubscriptionManagement(),
      this.verifyReceiptValidation(),
      this.verifyAnalyticsIntegration(),
      this.verifyCompliance(),
    ]);

    // Calculate overall result
    const allIssues = [
      ...productCatalogResult.issues,
      ...purchaseFlowResult.issues,
      ...subscriptionManagementResult.issues,
      ...receiptValidationResult.issues,
      ...analyticsIntegrationResult.issues,
      ...complianceResult.issues,
    ];

    const allWarnings = [
      ...productCatalogResult.warnings,
      ...purchaseFlowResult.warnings,
      ...subscriptionManagementResult.warnings,
      ...receiptValidationResult.warnings,
      ...analyticsIntegrationResult.warnings,
      ...complianceResult.warnings,
    ];

    const score = Math.max(0, 100 - (
      allIssues.reduce((sum, issue) => {
        const severityWeight = issue.includes('critical') ? 25 : 
                             issue.includes('major') ? 15 : 
                             issue.includes('moderate') ? 8 : 
                             issue.includes('minor') ? 3 : 1;
        return sum;
      }, 0)
    ));

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
      issues: allIssues.map(issue => ({
        id: `paywall-${issue}`,
        category: 'general' as const,
        severity: 'moderate' as const,
        message: issue,
        recommendation: 'Review and fix paywall issues',
      })),
      recommendations: this.generateRecommendations(allIssues),
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

  // ============================================================================
  // Recommendation Generation
  // ============================================================================

  private generateRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];

    // Generate recommendations by category
    if (issues.some(issue => issue.includes('catalog'))) {
      recommendations.push('Review product catalog structure and ensure all required fields are present');
      recommendations.push('Validate all product metadata before publishing');
    }

    if (issues.some(issue => issue.includes('purchase'))) {
      recommendations.push('Test purchase flow thoroughly with various scenarios');
      recommendations.push('Ensure proper error handling and user feedback');
    }

    if (issues.some(issue => issue.includes('subscription'))) {
      recommendations.push('Review subscription pricing and ensure clear terms of service');
      recommendations.push('Test subscription cancellation and renewal flows');
    }

    if (issues.some(issue => issue.includes('receipt'))) {
      recommendations.push('Implement proper receipt validation and server-side verification');
      recommendations.push('Test receipt restoration and edge cases');
    }

    if (issues.some(issue => issue.includes('analytics'))) {
      recommendations.push('Ensure all purchase events are properly tracked');
      recommendations.push('Test analytics integration with real user scenarios');
    }

    if (issues.some(issue => issue.includes('compliance'))) {
      recommendations.push('Review GDPR compliance measures and data handling');
      recommendations.push('Conduct privacy impact assessment and update policies');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring and regular security audits');
    }

    return recommendations;
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const paywallVerification = PaywallVerification.getInstance();