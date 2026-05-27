/**
 * Content Study Feature
 * V1 Implementation
 *
 * Enables users to study from:
 * - Pasted notes/text
 * - PDF uploads
 * - YouTube video transcripts
 *
 * Flow: Input → Extraction → Review → AI Generation → Study Plan → Session
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

// Service
export {
  submitContent,
  extractContent,
  generateStudyPlan,
  getContentStatus,
  submitFeedback,
  uploadStudyFile,
  deleteStudyFile,
  fetchContentHistory,
  fetchContentById,
  fetchGenerationById,
  updateContentText,
  deleteContent,
  pollContentStatus,
} from "./ContentStudyService";

// Hooks
export {
  useContentInput,
  useContentReview,
  useStudyPlan,
  useActiveStudyPlan,
  useCompleteStudyPlanTask,
  useContentHistory,
  useRateLimit,
  contentStudyQueryKeys,
} from "./hooks";

// Validation
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

// Persistence
export {
  DraftManager,
  StudySessionManager,
  CacheManager,
  SyncQueueManager,
  OfflineManager,
  draftManager,
  studySessionManager,
  cacheManager,
  syncQueueManager,
  offlineManager,
  getStorageUsage,
  clearAllContentStudyData,
} from "./persistence";

// Error Handling
export {
  ContentStudyErrorHandler,
  executeRecoveryAction,
  getErrorFallbackMessage,
  DefaultRetryStrategy,
  ExponentialBackoffStrategy,
  executeWithRetry,
  errorHandler,
} from "./errors";

// Events
export {
  contentStudyEvents,
  useContentStudyEvent,
  useContentStudyEvents,
  composeEventHandlers,
  initializeContentStudyEventIntegration,
  emitDraftSaved,
  emitContentSubmitted,
  emitExtractionStarted,
  emitExtractionProgress,
  emitExtractionComplete,
  emitExtractionFailed,
  emitGenerationStarted,
  emitGenerationComplete,
  emitGenerationFailed,
  emitTaskCompleted,
  emitQuizAnswered,
  emitSessionStarted,
  emitSessionEnded,
  emitFeedbackSubmitted,
  emitContentDeleted,
  emitRateLimitHit,
  emitOfflineSyncStarted,
  emitOfflineSyncComplete,
} from "./events";

// Analytics
export {
  ContentStudyAnalyticsService,
  contentStudyAnalytics,
  analytics,
  calculateMetrics,
  useContentStudyAnalytics,
} from "./analytics";

// Components
export {
  InputTypeSelector,
  TextPasteInput,
  PdfUploader,
  YouTubeInput,
  ExtractionProgress,
  StudyTaskList,
  QuizPanel,
  StudyPlanSuggestionCard,
  EmptyState,
  NoHistoryEmptyState,
  NoDraftsEmptyState,
  OfflineEmptyState,
  ErrorEmptyState,
  Skeleton,
  StudyPlanSkeleton,
  ContentHistorySkeleton,
  ExtractionSkeleton,
  NetworkStatus,
  InlineNetworkIndicator,
} from "./components";

// Screens
export {
  ContentInputScreen,
  ContentReviewScreen,
  StudyPlanScreen,
  StudyLibraryScreen,
} from "./screens";

// Integration
export {
  initializeContentStudy,
  trackContentStudyScreenView,
  prepareContentStudySession,
  verifyContentStudyIntegration,
} from "./integration";

// Visibility Gate
export { buildContentStudyVisibility } from "./content-study-visibility";
export type { ContentStudyVisibility } from "./content-study-visibility";
