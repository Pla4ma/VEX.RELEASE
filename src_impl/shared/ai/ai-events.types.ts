export interface AIEventPayloadMap {
    [AI_EVENT_CHANNELS.AI_REQUEST_STARTED]: AIRequestStartedEvent;
    [AI_EVENT_CHANNELS.AI_REQUEST_COMPLETED]: AIRequestCompletedEvent;
    [AI_EVENT_CHANNELS.AI_REQUEST_FAILED]: AIRequestFailedEvent;
    [AI_EVENT_CHANNELS.AI_CACHE_HIT]: AICacheHitEvent;
    [AI_EVENT_CHANNELS.AI_CACHE_MISS]: AICacheMissEvent;
    [AI_EVENT_CHANNELS.AI_FALLBACK_USED]: AIFallbackUsedEvent;
    [AI_EVENT_CHANNELS.AI_COACH_MESSAGE_GENERATED]: AICoachMessageGeneratedEvent;
    [AI_EVENT_CHANNELS.AI_SESSION_SUMMARY_GENERATED]: AISessionSummaryGeneratedEvent;
    [AI_EVENT_CHANNELS.AI_COMEBACK_PROMPT_GENERATED]: AIComebackPromptGeneratedEvent;
    [AI_EVENT_CHANNELS.AI_STREAK_NUDGE_GENERATED]: AIStreakNudgeGeneratedEvent;
    [AI_EVENT_CHANNELS.AI_WEEKLY_REFLECTION_GENERATED]: AIWeeklyReflectionGeneratedEvent;
    [AI_EVENT_CHANNELS.AI_ERROR_LOGGED]: AIErrorLoggedEvent;
}

export type AIRequestStartedEvent = z.infer<typeof AIRequestStartedEventSchema>;
export type AIRequestCompletedEvent = z.infer<typeof AIRequestCompletedEventSchema>;
export type AIRequestFailedEvent = z.infer<typeof AIRequestFailedEventSchema>;
export type AICacheHitEvent = z.infer<typeof AICacheHitEventSchema>;
export type AICacheMissEvent = z.infer<typeof AICacheMissEventSchema>;
export type AIFallbackUsedEvent = z.infer<typeof AIFallbackUsedEventSchema>;
export type AICoachMessageGeneratedEvent = z.infer<typeof AICoachMessageGeneratedEventSchema>;
export type AISessionSummaryGeneratedEvent = z.infer<typeof AISessionSummaryGeneratedEventSchema>;
export type AIComebackPromptGeneratedEvent = z.infer<typeof AIComebackPromptGeneratedEventSchema>;
export type AIStreakNudgeGeneratedEvent = z.infer<typeof AIStreakNudgeGeneratedEventSchema>;
export type AIWeeklyReflectionGeneratedEvent = z.infer<typeof AIWeeklyReflectionGeneratedEventSchema>;
export type AIErrorLoggedEvent = z.infer<typeof AIErrorLoggedEventSchema>;
