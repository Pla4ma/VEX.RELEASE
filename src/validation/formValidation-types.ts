export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  sanitizedData?: Record<string, unknown>;
}

export interface FormField {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea";
  value: unknown;
  required?: boolean;
  label?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  options?: string[];
  validation?: {
    custom?: (
      value: unknown,
      formData?: Record<string, unknown>,
    ) => string | null;
    dependsOn?: string[];
    compareWith?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  crossValidation?: Array<{
    fields: string[];
    validator: (values: Record<string, unknown>) => string | null;
    message: string;
  }>;
  submitButton?: { text: string; disabled?: boolean; loading?: boolean };
}
