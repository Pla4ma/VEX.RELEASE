export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: unknown;
}

export interface ValidationRule {
  name: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: unknown[];
  custom?: (value: unknown) => string | null;
  schema?: ValidationSchema;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}
