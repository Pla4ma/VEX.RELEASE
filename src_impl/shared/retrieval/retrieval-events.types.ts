export interface RetrievalEventPayloadMap {
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_STARTED]: RetrievalStartedEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_COMPLETED]: RetrievalCompletedEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_FAILED]: RetrievalFailedEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_CACHE_HIT]: RetrievalCacheHitEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_CACHE_MISS]: RetrievalCacheMissEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_FALLBACK_USED]: RetrievalFallbackUsedEvent;
    [RETRIEVAL_EVENT_CHANNELS.SESSION_HISTORY_RETRIEVED]: SessionHistoryRetrievedEvent;
    [RETRIEVAL_EVENT_CHANNELS.USER_PATTERNS_RETRIEVED]: UserPatternsRetrievedEvent;
    [RETRIEVAL_EVENT_CHANNELS.COACH_MEMORY_RETRIEVED]: CoachMemoryRetrievedEvent;
    [RETRIEVAL_EVENT_CHANNELS.REFLECTION_CONTEXT_RETRIEVED]: ReflectionContextRetrievedEvent;
    [RETRIEVAL_EVENT_CHANNELS.MEMORY_STORED]: MemoryStoredEvent;
    [RETRIEVAL_EVENT_CHANNELS.MEMORY_UPDATED]: MemoryUpdatedEvent;
    [RETRIEVAL_EVENT_CHANNELS.MEMORY_CONSOLIDATED]: MemoryConsolidatedEvent;
    [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_ERROR_LOGGED]: RetrievalErrorLoggedEvent;
}

export type RetrievalStartedEvent = z.infer<typeof RetrievalStartedEventSchema>;
export type RetrievalCompletedEvent = z.infer<typeof RetrievalCompletedEventSchema>;
export type RetrievalFailedEvent = z.infer<typeof RetrievalFailedEventSchema>;
export type RetrievalCacheHitEvent = z.infer<typeof RetrievalCacheHitEventSchema>;
export type RetrievalCacheMissEvent = z.infer<typeof RetrievalCacheMissEventSchema>;
export type RetrievalFallbackUsedEvent = z.infer<typeof RetrievalFallbackUsedEventSchema>;
export type SessionHistoryRetrievedEvent = z.infer<typeof SessionHistoryRetrievedEventSchema>;
export type UserPatternsRetrievedEvent = z.infer<typeof UserPatternsRetrievedEventSchema>;
export type CoachMemoryRetrievedEvent = z.infer<typeof CoachMemoryRetrievedEventSchema>;
export type ReflectionContextRetrievedEvent = z.infer<typeof ReflectionContextRetrievedEventSchema>;
export type MemoryStoredEvent = z.infer<typeof MemoryStoredEventSchema>;
export type MemoryUpdatedEvent = z.infer<typeof MemoryUpdatedEventSchema>;
export type MemoryConsolidatedEvent = z.infer<typeof MemoryConsolidatedEventSchema>;
export type RetrievalErrorLoggedEvent = z.infer<typeof RetrievalErrorLoggedEventSchema>;
