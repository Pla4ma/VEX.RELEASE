export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    metadata?: {
        characterCount?: number;
        wordCount?: number;
        estimatedReadTime?: number;
        youtubeVideoId?: string;
        fileType?: string;
        };
}
