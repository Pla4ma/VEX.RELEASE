/**
 * Barrel re-export for ai-coach domain types.
 * Import from specific type modules when possible.
 */
export type {
  VoiceTone,
  CoachStyle,
  MessageCategory,
  ConditionType,
  MessageStatus,
  DeliveryMethod,
  CoachPersona,
  MessageCondition,
  CoachMessageTemplate,
  CoachMessage,
  CoachHistory,
} from './coach-message-types';

export type {
  InterventionType,
  InterventionSeverity,
  SignalType,
  TriggerType,
  ActionType,
  ExecutionStatus,
  BehaviorSignal,
  BehaviorProfile,
  InterventionTrigger,
  InterventionCondition,
  InterventionAction,
  InterventionRule,
  UserResponse,
  InterventionExecution,
} from './coach-intervention-types';

export type {
  RecommendationType,
  RecommendationSource,
  RecommendationStatus,
  ReminderType,
  ComebackStatus,
  CoachUserState,
  SessionRecommendation,
  ReminderPlan,
  ComebackMessage,
  ComebackPlan,
  DifficultyProfile,
  CoachState,
  CoachEffectiveness,
  GenerateMessageInput,
  ProcessBehaviorSignalInput,
  EvaluateInterventionsInput,
  CreateRecommendationInput,
  ScheduleReminderInput,
  ActivateComebackInput,
  AdjustDifficultyInput,
  MarkMessageActionInput,
  UpdateCoachPreferencesInput,
} from './coach-state-types';
