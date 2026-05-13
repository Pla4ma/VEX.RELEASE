export interface DifficultySuggestion {
    suggestion: SessionDifficulty | null;
    reason: string;
    confidence: 'low' | 'medium' | 'high';
    stats: {
        sessionsAnalyzed: number;
        averageGrade: number;
        averagePurity: number;
        };
}
