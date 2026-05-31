/**
 * Content Study Types
 *
 * Split into domain-specific type files for maintainability.
 * All exports maintain backward compatibility.
 */

// Enums
export {
  ContentSourceTypeSchema,
  ContentStatusSchema,
  TaskPrioritySchema,
  QuizDifficultySchema,
  SessionDifficultySchema,
  CONTENT_STUDY_CONSTANTS,
} from './enums';
export type {
  ContentSourceType,
  ContentStatus,
  TaskPriority,
  QuizDifficulty,
  SessionDifficulty,
  InputTab,
  ExtractionStage,
} from './enums';

// Domain
export type {
  StudyTask,
  QuizItem,
  SessionPlan,
  KeyConcept,
  StudySummary,
} from './domain';

// Content & Generation
export type { StudyContent, StudyGeneration } from './content';
export {
  StudyContentSchema,
  StudyGenerationSchema,
  SubmitFeedbackRequestSchema,
} from './schemas';
export type { SubmitFeedbackRequest } from './schemas';

// API Inputs/Outputs
export { SubmitContentRequestSchema } from './inputs';
export type {
  SubmitContentRequest,
  SubmitContentResponse,
  GenerateStudyPlanRequest,
  GenerateStudyPlanResponse,
  UpdateContentTextRequest,
  ContentHistoryFilters,
} from './inputs';

// State
export type {
  ValidationError,
  ErrorRecoveryAction,
  TextEdit,
  ContentInputState,
  ContentReviewState,
  StudyPlanState,
  SessionPreparationData,
} from './state';

// Navigation
export type { ContentStudyStackParamList } from './navigation';

// Component Props
export { ContentStudyErrorCode } from './components';
export type {
  ContentStudyError,
  InputTypeSelectorProps,
  TextPasteInputProps,
  PdfUploaderProps,
  YouTubeInputProps,
  ExtractionProgressProps,
  StudyTaskListProps,
  QuizPanelProps,
  QuizItemProps,
  SessionPrepPanelProps,
} from './components';

// Persistence Types
export type {
  PersistedStudySession,
  PersistedDraft,
  LocalCacheEntry,
  SyncQueueItem,
  ExtractContentRequest,
} from './persistence';

// Event Map
export type { ContentStudyEventMap } from './events';

// Analytics Types
export type {
  ContentStudyAnalyticsEvent,
  ContentStudyAnalyticsEventName,
  ContentStudyMetrics,
} from './analytics';
