export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sanitized?: unknown;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
  recoveryHint?: string;
}
