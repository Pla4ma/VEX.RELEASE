export interface AICoachEventPayloadMap {
    [AI_COACH_EVENT_CHANNELS.MESSAGE_GENERATED]: CoachMessageGeneratedEvent;
    [AI_COACH_EVENT_CHANNELS.MESSAGE_DELIVERED]: CoachMessageDeliveredEvent;
    [AI_COACH_EVENT_CHANNELS.MESSAGE_ACTION_TAKEN]: CoachMessageActionTakenEvent;
    [AI_COACH_EVENT_CHANNELS.STATE_CHANGED]: CoachStateChangedEvent;
    [AI_COACH_EVENT_CHANNELS.INTERVENTION_TRIGGERED]: InterventionTriggeredEvent;
    [AI_COACH_EVENT_CHANNELS.BEHAVIOR_SIGNAL_DETECTED]: BehaviorSignalDetectedEvent;
    [AI_COACH_EVENT_CHANNELS.STREAK_RISK_DETECTED]: StreakRiskDetectedEvent;
    [AI_COACH_EVENT_CHANNELS.COMEBACK_ACTIVATED]: ComebackActivatedEvent;
    [AI_COACH_EVENT_CHANNELS.COMEBACK_COMPLETED]: ComebackCompletedEvent;
    [AI_COACH_EVENT_CHANNELS.RECOMMENDATION_GENERATED]: RecommendationGeneratedEvent;
    [AI_COACH_EVENT_CHANNELS.DIFFICULTY_ADJUSTED]: DifficultyAdjustedEvent;
    [AI_COACH_EVENT_CHANNELS.PREFERENCES_UPDATED]: CoachPreferencesUpdatedEvent;
}

export interface AICoachEventHandlers {
    onMessageGenerated?: AICoachEventHandler<'coach:messageGenerated'>;
    onMessageDelivered?: AICoachEventHandler<'coach:messageDelivered'>;
    onMessageActionTaken?: AICoachEventHandler<'coach:messageActionTaken'>;
    onStateChanged?: AICoachEventHandler<'coach:stateChanged'>;
    onInterventionTriggered?: AICoachEventHandler<'coach:interventionTriggered'>;
    onBehaviorSignalDetected?: AICoachEventHandler<'coach:behaviorSignalDetected'>;
    onStreakRiskDetected?: AICoachEventHandler<'coach:streakRiskDetected'>;
    onComebackActivated?: AICoachEventHandler<'coach:comebackActivated'>;
    onComebackCompleted?: AICoachEventHandler<'coach:comebackCompleted'>;
    onRecommendationGenerated?: AICoachEventHandler<'coach:recommendationGenerated'>;
    onDifficultyAdjusted?: AICoachEventHandler<'coach:difficultyAdjusted'>;
    onPreferencesUpdated?: AICoachEventHandler<'coach:preferencesUpdated'>;
}

export type CoachMessageGeneratedEvent = z.infer<typeof CoachMessageGeneratedEventSchema>;
export type CoachMessageDeliveredEvent = z.infer<typeof CoachMessageDeliveredEventSchema>;
export type CoachMessageActionTakenEvent = z.infer<typeof CoachMessageActionTakenEventSchema>;
export type CoachStateChangedEvent = z.infer<typeof CoachStateChangedEventSchema>;
export type InterventionTriggeredEvent = z.infer<typeof InterventionTriggeredEventSchema>;
export type BehaviorSignalDetectedEvent = z.infer<typeof BehaviorSignalDetectedEventSchema>;
export type StreakRiskDetectedEvent = z.infer<typeof StreakRiskDetectedEventSchema>;
export type ComebackActivatedEvent = z.infer<typeof ComebackActivatedEventSchema>;
export type ComebackCompletedEvent = z.infer<typeof ComebackCompletedEventSchema>;
export type RecommendationGeneratedEvent = z.infer<typeof RecommendationGeneratedEventSchema>;
export type DifficultyAdjustedEvent = z.infer<typeof DifficultyAdjustedEventSchema>;
export type CoachPreferencesUpdatedEvent = z.infer<typeof CoachPreferencesUpdatedEventSchema>;
export type AICoachEventHandler<T extends keyof AICoachEventPayloadMap> = (payload: AICoachEventPayloadMap[T]) => void | Promise<void>;
