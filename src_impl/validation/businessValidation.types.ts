/**
 * Business Validation Layer
 *
 * Comprehensive validation for business logic, rules, constraints,
 * and domain-specific requirements across different business contexts.
 */
export interface BusinessValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    businessRules: string[];
    recommendations: string[];
}

export interface BusinessRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    validator: (data: DynamicValue, context?: DynamicValue) => boolean;
    message: string;
}

export interface BusinessContext {
    domain: string;
    role: string;
    permissions: string[];
    environment: 'development' | 'staging' | 'production';
    region?: string;
    currency?: string;
}
