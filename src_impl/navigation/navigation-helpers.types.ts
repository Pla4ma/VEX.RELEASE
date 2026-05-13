/** Deep link validation result */
export interface DeepLinkValidationResult {
    isValid: boolean;
    sanitizedParams?: Record<string, unknown>;
    error?: string;
    fallbackRoute?: string;
}
