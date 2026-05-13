export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions?: string[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code: string;
}
