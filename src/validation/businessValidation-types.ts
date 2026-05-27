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
  severity: "error" | "warning" | "info";
  validator: (data: unknown, context?: unknown) => boolean;
  message: string;
}

export interface BusinessContext {
  domain: string;
  role: string;
  permissions: string[];
  environment: "development" | "staging" | "production";
  region?: string;
  currency?: string;
}
