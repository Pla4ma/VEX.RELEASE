export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
  recoveryHint?: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  sanitized?: unknown;
}

export class AnalyticsValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public recoveryHint?: string,
    public value?: unknown,
  ) {
    super(message);
    this.name = "AnalyticsValidationError";
  }
}
