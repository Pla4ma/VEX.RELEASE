/**
 * Content Study Types
 *
 * Split into domain-specific type files for maintainability.
 * All exports maintain backward compatibility.
 */

// Import types needed for local type definitions
import type { ContentSourceType, ExtractionStage } from './enums';
import type { ContentStudyError } from './components';
import type { SessionPreparationData } from './state';

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
export type {
  StudyContent,
  StudyGeneration,
} from './content';
export {
  StudyContentSchema,
  StudyGenerationSchema,
  SubmitFeedbackRequestSchema,
} from './schemas';
export type {
  SubmitFeedbackRequest,
} from './schemas';

// API Inputs/Outputs
export {
  SubmitContentRequestSchema,
} from './inputs';
export type {
  SubmitContentRequest,
  SubmitContentResponse,
  GenerateStudyPlanRequest,
  GenerateStudyPlanResponse,
  UpdateContentTextRequest,
  ContentHistoryFilters,
} from './inputs';

// ExtractContentResponse already exported from inputs

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
export type {
  ContentStudyStackParamList,
} from './navigation';

// Component Props
export {
  ContentStudyErrorCode,
} from './components';
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

// Persistence Types (from backup)
export interface PersistedStudySession {
  generationId: string;
  contentId: string;
  startTime: number;
  endTime?: number;
  completedTasks: string[];
  quizResults: Record<string, { correct: boolean; timeSpent: number }>;
  totalPauseTime: number;
  interruptions: number;
  finalRating?: number;
  synced: boolean;
}

export interface PersistedDraft {
  id: string;
  userId: string;
  type: 'paste' | 'pdf' | 'youtube';
  activeTab: 'paste' | 'pdf' | 'youtube';
  pastedText: string;
  youtubeUrl: string;
  selectedFile: { uri: string; name: string; size: number; type: string } | null;
  createdAt: number;
  updatedAt: number;
  autoSaveVersion: number;
}

export interface LocalCacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  etag?: string;
  source: 'memory' | 'localStorage' | 'indexedDB';
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'content' | 'generation' | 'feedback';
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
}

// Additional API Types
export interface ExtractContentRequest {
  contentId: string;
}

// Event Map for content-study events
export interface ContentStudyEventMap {
  'content-study:draft-saved': { draftId: string; timestamp: number };
  'content-study:content-submitted': { contentId: string; type: ContentSourceType };
  'content-study:extraction-started': { contentId: string; stage: ExtractionStage };
  'content-study:extraction-progress': { contentId: string; progress: number; stage: ExtractionStage };
  'content-study:extraction-complete': { contentId: string; extractedLength: number };
  'content-study:extraction-failed': { contentId: string; error: ContentStudyError };
  'content-study:generation-started': { contentId: string; generationId: string };
  'content-study:generation-complete': { generationId: string; taskCount: number; quizCount: number };
  'content-study:generation-failed': { contentId: string; error: ContentStudyError };
  'content-study:task-completed': { generationId: string; taskId: string; completedAt: number };
  'content-study:quiz-answered': { generationId: string; quizId: string; isCorrect: boolean };
  'content-study:session-started': { generationId: string; sessionConfig: SessionPreparationData };
  'content-study:session-ended': { generationId: string; duration: number; rating?: number };
  'content-study:feedback-submitted': { generationId: string; rating: number };
  'content-study:content-deleted': { contentId: string };
  'content-study:rate-limit-hit': { userId: string; remaining: number; resetsAt: number };
  'content-study:offline-sync-started': { queueLength: number };
  'content-study:offline-sync-complete': { synced: number; failed: number };
}

// Analytics Types
export interface ContentStudyAnalyticsEvent {
  eventName: ContentStudyAnalyticsEventName;
  timestamp: number;
  userId: string;
  sessionId?: string;
  properties: Record<string, unknown>;
  context: {
    appVersion: string;
    platform: string;
    screenSize: string;
    isOnline: boolean;
  };
}

export type ContentStudyAnalyticsEventName =
  | 'CONTENT_SUBMITTED'
  | 'CONTENT_EXTRACTED'
  | 'STUDY_PLAN_GENERATED'
  | 'STUDY_PLAN_VIEWED'
  | 'TASK_COMPLETED'
  | 'QUIZ_ANSWERED'
  | 'SESSION_STARTED'
  | 'SESSION_COMPLETED'
  | 'content_study_screen_viewed'
  | 'content_study_input_opened'
  | 'content_study_tab_switched'
  | 'content_study_text_pasted'
  | 'content_study_file_selected'
  | 'content_study_youtube_entered'
  | 'content_study_submitted'
  | 'content_study_extraction_started'
  | 'content_study_extraction_progress'
  | 'content_study_extraction_completed'
  | 'content_study_extraction_failed'
  | 'content_study_review_opened'
  | 'content_study_text_edited'
  | 'content_study_generation_started'
  | 'content_study_generation_completed'
  | 'content_study_generation_failed'
  | 'content_study_plan_viewed'
  | 'content_study_plan_opened'
  | 'content_study_task_completed'
  | 'content_study_task_viewed'
  | 'content_study_quiz_answered'
  | 'content_study_quiz_viewed'
  | 'content_study_session_started'
  | 'content_study_session_completed'
  | 'content_study_feedback_submitted'
  | 'content_study_rate_limited'
  | 'content_study_offline_mode'
  | 'content_study_error';

export interface ContentStudyMetrics {
  totalContentsSubmitted: number;
  bySourceType: {
    PASTE: number;
    PDF: number;
    YOUTUBE: number;
    URL: number;
  };
  averageContentLength: number;
  averageExtractionTime: number;
  extractionSuccessRate: number;
  totalGenerations: number;
  averageGenerationTime: number;
  generationSuccessRate: number;
  totalStudyPlansGenerated: number;
  totalTasksCompleted: number;
  averageTasksPerGeneration: number;
  averageQuizItemsPerGeneration: number;
  averageSessionDuration: number;
  taskCompletionRate: number;
  quizAccuracyRate: number;
  averageUserRating: number;
  returnRate: number;
  errorRateByType: Record<string, number>;
  retrySuccessRate: number;
  totalTimeSpent: number;
  averageQuizScore: number;
}
