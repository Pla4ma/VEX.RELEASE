/**
 * AI Coach Feature - Domain Types
 *
 * Dependencies:
 * - Sessions (coach messages during session, data for personalization)
 * - Streaks (coach encourages streak maintenance, risk alerts)
 * - Progression (coach tailors advice to level)
 * - Notifications (coach sends reminders, interventions)
 * - Analytics (coach interaction tracked)
 * - Settings (coach personality preferences)
 */
export interface CoachPersona {
    id: string;
    name: string;
    description: string;
    avatarUrl: string | null;
    voiceTone: VoiceTone;
    style: CoachStyle;
    catchphrase: string;
    defaultEnabled: boolean;
}

export interface CoachMessageTemplate {
    id: string;
    personaId: string;
    category: MessageCategory;
    subcategory: string;
    priority: number;
    content: string;
    conditions: MessageCondition[];
    variations: string[];
    cooldownHours: number;
}

export interface MessageCondition {
    type: ConditionType;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
    value: unknown;
    field?: string;
}

export interface BehaviorSignal {
    id: string;
    userId: string;
    signalType: SignalType;
    value: number;
    confidence: number;
    timestamp: number;
    metadata: Record<string, unknown>;
    expiresAt: number;
}

export interface BehaviorProfile {
    userId: string;
    signals: BehaviorSignal[];
    lastUpdated: number;
    confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    coldStart: boolean;
    dataPoints: number;
}

export interface InterventionRule {
    id: string;
    name: string;
    trigger: InterventionTrigger;
    conditions: InterventionCondition[];
    action: InterventionAction;
    priority: number;
    cooldownHours: number;
    maxPerDay: number;
    enabled: boolean;
}

export interface InterventionTrigger {
    type: TriggerType;
    threshold?: number;
}

export interface InterventionCondition {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: unknown;
}

export interface InterventionAction {
    type: ActionType;
    messageTemplateId: string | null;
    deliveryMethod: DeliveryMethod;
    delayMinutes: number;
}

export interface InterventionExecution {
    id: string;
    userId: string;
    ruleId: string;
    status: ExecutionStatus;
    triggeredAt: number;
    executedAt: number | null;
    messageId: string | null;
    userResponse: UserResponse | null;
    effectiveness: number | null;
}

export interface UserResponse {
    action: 'STARTED_SESSION' | 'DISMISSED' | 'ENGAGED' | 'IGNORED' | 'MUTED';
    timestamp: number;
    metadata: Record<string, unknown>;
}

export interface SessionRecommendation {
    id: string;
    userId: string;
    type: RecommendationType;
    suggestedDuration: number;
    suggestedDifficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
    reasoning: string;
    confidence: number;
    basedOn: RecommendationSource[];
    expiresAt: number;
    status: RecommendationStatus;
}

export interface ReminderPlan {
    id: string;
    userId: string;
    reminderType: ReminderType;
    scheduledFor: number;
    messageId: string;
    priority: number;
    sent: boolean;
    sentAt: number | null;
    delivered: boolean;
    opened: boolean;
}

export interface ComebackPlan {
    id: string;
    userId: string;
    previousStreak: number;
    daysInactive: number;
    status: ComebackStatus;
    startedAt: number;
    expiresAt: number;
    sessionsCompleted: number;
    targetSessions: number;
    bonusMultiplier: number;
    messages: ComebackMessage[];
}

export interface ComebackMessage {
    id: string;
    day: number;
    content: string;
    sent: boolean;
    sentAt: number | null;
}

export interface DifficultyProfile {
    userId: string;
    currentDifficulty: number;
    recommendedDifficulty: number;
    lastAdjustmentAt: number;
    adjustmentReason: string | null;
    successRateRecent: number;
    successRateOverall: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface CoachMessage {
    id: string;
    userId: string;
    personaId: string;
    category: MessageCategory;
    content: string;
    deliveryMethod: DeliveryMethod;
    priority: number;
    status: MessageStatus;
    createdAt: number;
    scheduledFor: number | null;
    deliveredAt: number | null;
    readAt: number | null;
    dismissedAt: number | null;
    actionTaken: string | null;
    actionTakenAt: number | null;
}

export interface CoachHistory {
    userId: string;
    messages: CoachMessage[];
    totalMessages: number;
    responseRate: number;
    preferredCategories: MessageCategory[];
    mutedCategories: MessageCategory[];
    lastMessageAt: number;
}

export interface CoachState {
    userId: string;
    currentState: CoachUserState;
    previousState: CoachUserState | null;
    stateEnteredAt: number;
    personaId: string;
    behaviorProfile: BehaviorProfile | null;
    lastInterventionAt: number | null;
    interventionsToday: number;
    muteUntil: number | null;
    reduceNotifications: boolean;
}

export interface CoachEffectiveness {
    messageId: string;
    category: MessageCategory;
    userId: string;
    deliveredAt: number;
    opened: boolean;
    actionTaken: boolean;
    actionType: string | null;
    timeToAction: number | null;
    subsequentSessionCompleted: boolean;
    subsequentSessionQuality: number | null;
}

export interface GenerateMessageInput {
    userId: string;
    category: MessageCategory;
    context: Record<string, unknown>;
    preferredDelivery: DeliveryMethod;
}

export interface ProcessBehaviorSignalInput {
    userId: string;
    signalType: SignalType;
    value: number;
    metadata?: Record<string, unknown>;
}

export interface EvaluateInterventionsInput {
    userId: string;
    trigger: TriggerType;
    context: Record<string, unknown>;
}

export interface CreateRecommendationInput {
    userId: string;
    type: RecommendationType;
    context: Record<string, unknown>;
}

export interface ScheduleReminderInput {
    userId: string;
    reminderType: ReminderType;
    scheduledFor: number;
    priority?: number;
}

export interface ActivateComebackInput {
    userId: string;
    previousStreak: number;
    daysInactive: number;
}

export interface AdjustDifficultyInput {
    userId: string;
    reason: string;
    targetDifficulty?: number;
}

export interface MarkMessageActionInput {
    messageId: string;
    action: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateCoachPreferencesInput {
    userId: string;
    personaId?: string;
    mutedCategories?: MessageCategory[];
    reduceNotifications?: boolean;
    muteUntil?: number | null;
}
