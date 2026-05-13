/**
 * Data Validation Layer
 *
 * Comprehensive validation for various data types including strings, numbers,
 * dates, arrays, objects, and complex data structures with type safety.
 */
export interface DataValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedData?: DynamicValue;
}

export interface ValidationRule {
    name: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: DynamicValue[];
    custom?: (value: DynamicValue) => string | null;
    schema?: ValidationSchema;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}
