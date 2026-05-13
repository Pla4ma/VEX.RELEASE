export interface CompletionValidationResult {
    valid: boolean;
    errors: string[];
    suspicious: boolean;
    estimatedLegitimateTime?: number;
}

export interface DifficultyMetrics {
    completionRate: number;
    avgTimeSpent: number;
    avgAttempts: number;
    abandonmentRate: number;
}
