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

export class SettingsValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public recoveryHint?: string,
  ) {
    super(message);
    this.name = "SettingsValidationError";
  }
}
