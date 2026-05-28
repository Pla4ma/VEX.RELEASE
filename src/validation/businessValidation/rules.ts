import type {
  BusinessContext,
  BusinessRule,
  BusinessValidationResult,
} from "./types";

export const validateBusinessRules = (
  data: unknown,
  rules: BusinessRule[],
  context?: BusinessContext,
): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  for (const rule of rules) {
    try {
      const isValid = rule.validator(data, context);
      if (!isValid) {
        switch (rule.severity) {
          case "error":
            errors.push(rule.message);
            break;
          case "warning":
            warnings.push(rule.message);
            break;
          case "info":
            businessRules.push(rule.message);
            break;
        }
      }
    } catch (error) {
      warnings.push(`Error validating rule ${rule.id}: ${error}`);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRules,
    recommendations,
  };
};
