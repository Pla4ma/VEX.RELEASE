/**
 * Interface for AI API client
 * Implementations will be in the React Native app
 * All implementations call backend, NOT Gemini directly
 */
export interface AIAPIClient {
    /**
     * Send AI request to backend
     * @param request - Validated AI request
     * @returns Promise of validated AI response
     */
    sendRequest(request: AIRequest): Promise<AIResponse>;
    /**
     * Generate coach message
     */
    generateCoachMessage(request: Omit<GenerateCoachMessageRequest, 'requestType'>): Promise<GenerateCoachMessageResponse>;
    /**
     * Generate session summary
     */
    generateSessionSummary(request: Omit<GenerateSessionSummaryRequest, 'requestType'>): Promise<GenerateSessionSummaryResponse>;
    /**
     * Generate comeback prompt
     */
    generateComebackPrompt(request: Omit<GenerateComebackPromptRequest, 'requestType'>): Promise<GenerateComebackPromptResponse>;
    /**
     * Generate streak risk nudge
     */
    generateStreakRiskNudge(request: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>): Promise<GenerateStreakRiskNudgeResponse>;
    /**
     * Generate weekly reflection
     */
    generateWeeklyReflection(request: Omit<GenerateWeeklyReflectionRequest, 'requestType'>): Promise<GenerateWeeklyReflectionResponse>;
}

export interface AIClientError {
    code: AIClientErrorCode;
    message: string;
    requestId?: string;
    retryable: boolean;
    fallbackContent?: string;
}

/**
 * Track AI usage on the client for analytics
 * This is sent to the backend for aggregation
 */
export interface AIClientUsageMetrics {
    requestId: string;
    userId: string;
    requestType: string;
    timestamp: number;
    networkDurationMs: number;
    cacheHit: boolean;
    success: boolean;
    fallbackUsed: boolean;
    errorCode?: string;
}

export type AIClientErrorCode = z.infer<typeof AIClientErrorCodeSchema>;
export type AIRequestMetadata = z.infer<typeof AIRequestMetadataSchema>;
