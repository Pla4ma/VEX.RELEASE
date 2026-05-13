/**
 * Gemini API Request (backend-only)
 */
export interface GeminiAPIRequest {
    model: string;
    contents: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
        }>;
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        topK?: number;
        };
    safetySettings?: Array<{
        category: string;
        threshold: string;
        }>;
}

/**
 * Gemini API Response (backend-only)
 */
export interface GeminiAPIResponse {
    candidates: Array<{
        content: {
          parts: Array<{ text: string }>;
          role: string;
        };
        finishReason: string;
        index: number;
        safetyRatings: Array<{
          category: string;
          probability: string;
        }>;
        }>;
    usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
        };
}

/**
 * Prompt template for backend use
 */
export interface PromptTemplate {
    id: string;
    name: string;
    version: string;
    systemPrompt: string;
    userPromptTemplate: string;
    variables: string[];
    outputSchema: z.ZodSchema<unknown>;
    modelConfig: {
        model: string;
        temperature: number;
        maxOutputTokens: number;
        };
}

export interface AIError {
    code: AIErrorCode;
    message: string;
    retryable: boolean;
    originalError?: unknown;
    context?: Record<string, unknown>;
}

export interface AICacheEntry {
    key: string;
    request: AIRequest;
    response: AIResponse;
    timestamp: number;
    ttl: number;
}

export interface AIGenerationMetrics {
    requestType: AIRequestType;
    processingTimeMs: number;
    promptTokens: number;
    responseTokens: number;
    cacheHit: boolean;
    success: boolean;
    errorCode?: AIErrorCode;
}

export type AIRequestType = z.infer<typeof AIRequestTypeSchema>;
export type AIBaseRequest = z.infer<typeof AIBaseRequestSchema>;
export type AIBaseResponse = z.infer<typeof AIBaseResponseSchema>;
export type GenerateCoachMessageRequest = z.infer<typeof GenerateCoachMessageRequestSchema>;
export type GenerateCoachMessageResponse = z.infer<typeof GenerateCoachMessageResponseSchema>;
export type GenerateSessionSummaryRequest = z.infer<typeof GenerateSessionSummaryRequestSchema>;
export type GenerateSessionSummaryResponse = z.infer<typeof GenerateSessionSummaryResponseSchema>;
export type GenerateComebackPromptRequest = z.infer<typeof GenerateComebackPromptRequestSchema>;
export type GenerateComebackPromptResponse = z.infer<typeof GenerateComebackPromptResponseSchema>;
export type GenerateStreakRiskNudgeRequest = z.infer<typeof GenerateStreakRiskNudgeRequestSchema>;
export type GenerateStreakRiskNudgeResponse = z.infer<typeof GenerateStreakRiskNudgeResponseSchema>;
export type GenerateWeeklyReflectionRequest = z.infer<typeof GenerateWeeklyReflectionRequestSchema>;
export type GenerateWeeklyReflectionResponse = z.infer<typeof GenerateWeeklyReflectionResponseSchema>;
export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type AIErrorCode = z.infer<typeof AIErrorCodeSchema>;
