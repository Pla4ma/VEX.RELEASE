/**
 * Content Study — Types & Constants barrel
 * Re-exports all public types and constant definitions.
 */

// Types
export type {
  ContentSourceType,
  ContentStatus,
  StudyTask,
  QuizItem,
  SessionPlan,
  StudyContent,
  StudyGeneration,
  InputTab,
  ContentInputState,
  ContentReviewState,
  StudyPlanState,
  ContentStudyStackParamList,
  ContentStudyError,
  ValidationError,
  TextEdit,
  ExtractionStage,
  SessionPreparationData,
  PersistedDraft,
  PersistedStudySession,
  LocalCacheEntry,
  SyncQueueItem,
  InputTypeSelectorProps,
  TextPasteInputProps,
  PdfUploaderProps,
  YouTubeInputProps,
  ExtractionProgressProps,
  StudyTaskListProps,
  QuizPanelProps,
} from "./types";

// Active Study Plan type from hooks helpers
export type { ActiveStudyPlan } from "./hooks/helpers";

export { CONTENT_STUDY_CONSTANTS } from "./types";

// Constants
export {
  CONTENT_STUDY_API,
  CONTENT_SOURCES,
  CONTENT_STATUS_CONFIG,
  STUDY_PLAN_CONFIG,
  TASK_PRIORITY_CONFIG,
  QUIZ_DIFFICULTY_CONFIG,
  ERROR_MESSAGES,
  UI_TEXT,
  VALIDATION_RULES,
  ANALYTICS_EVENTS,
} from "./constants";

// Validation schemas and helpers
export {
  YouTubeUrlSchema,
  FileUploadSchema,
  PastedTextSchema,
  TitleSchema,
  validateYouTubeUrl,
  validatePastedText,
  validateFileUpload,
  validateTitle,
  validateContentSubmission,
  buildError,
  isRecoverableError,
  shouldRetry,
  getRetryDelay,
  sanitizeTextForStorage,
  truncateText,
  extractYouTubeVideoId,
  isValidFileType,
  formatValidationErrors,
} from "./validation";
