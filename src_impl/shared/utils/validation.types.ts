export interface RangeValidationResult {
    valid: boolean;
    clamped: number;
    violations: string[];
}

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors: string[];
    fieldErrors: Record<string, string[]>;
}

export interface PasswordValidationResult {
    valid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string[];
}
