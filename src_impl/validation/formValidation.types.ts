/**
 * Form Validation Layer
 *
 * Comprehensive validation for form data including field validation,
 * cross-field validation, form state management, and user experience
 * considerations.
 */
export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
    sanitizedData?: DynamicRecord;
}

export interface FormField {
    name: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
    value: DynamicValue;
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
        custom?: (value: DynamicValue, formData?: DynamicRecord) => string | null;
        dependsOn?: string[];
        compareWith?: string;
        message?: string;
        };
}

export interface FormConfig {
    fields: FormField[];
    crossValidation?: Array<{
        fields: string[];
        validator: (values: DynamicRecord) => string | null;
        message: string;
        }>;
    submitButton?: {
        text: string;
        disabled?: boolean;
        loading?: boolean;
        };
}
