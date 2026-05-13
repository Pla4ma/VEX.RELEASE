export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: unknown;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
}

export type SessionValidationInput = z.infer<typeof SessionValidationSchema>;
