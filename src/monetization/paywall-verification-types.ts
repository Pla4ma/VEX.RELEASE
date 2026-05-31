/**
 * Paywall and Monetization Verification - Types
 */

export interface PaywallVerificationResult {
  passed: boolean;
  score: number;
  results: {
    productCatalog: ValidationSection;
    purchaseFlow: ValidationSection;
    subscriptionManagement: ValidationSection;
    receiptValidation: ValidationSection;
    analyticsIntegration: ValidationSection;
    compliance: ComplianceSection;
  };
  issues: PaywallIssue[];
  recommendations: string[];
  timestamp: number;
}

export interface ValidationSection {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export interface ComplianceSection extends ValidationSection {
  gdprCompliant: boolean;
}

export interface PaywallIssue {
  id: string;
  category:
    | 'product-catalog'
    | 'purchase-flow'
    | 'subscription'
    | 'receipt'
    | 'analytics'
    | 'compliance'
    | 'general';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  message: string;
  recommendation: string;
  gdprArticle?: string;
}
