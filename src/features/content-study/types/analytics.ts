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
  | "CONTENT_SUBMITTED"
  | "CONTENT_EXTRACTED"
  | "STUDY_PLAN_GENERATED"
  | "STUDY_PLAN_VIEWED"
  | "TASK_COMPLETED"
  | "QUIZ_ANSWERED"
  | "SESSION_STARTED"
  | "SESSION_COMPLETED"
  | "content_study_screen_viewed"
  | "content_study_input_opened"
  | "content_study_tab_switched"
  | "content_study_text_pasted"
  | "content_study_file_selected"
  | "content_study_youtube_entered"
  | "content_study_submitted"
  | "content_study_extraction_started"
  | "content_study_extraction_progress"
  | "content_study_extraction_completed"
  | "content_study_extraction_failed"
  | "content_study_review_opened"
  | "content_study_text_edited"
  | "content_study_generation_started"
  | "content_study_generation_completed"
  | "content_study_generation_failed"
  | "content_study_plan_viewed"
  | "content_study_plan_opened"
  | "content_study_task_completed"
  | "content_study_task_viewed"
  | "content_study_quiz_answered"
  | "content_study_quiz_viewed"
  | "content_study_session_started"
  | "content_study_session_completed"
  | "content_study_feedback_submitted"
  | "content_study_rate_limited"
  | "content_study_offline_mode"
  | "content_study_error";

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
