/**
 * Content Study — Runtime barrel
 * Re-exports all services, hooks, persistence, errors, events,
 * analytics, components, screens, and integration modules.
 */

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
