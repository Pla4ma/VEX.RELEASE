import { captureSilentFailure } from "../../utils/silent-failure";
import type {
  ContentStudyAnalyticsEvent,
  ContentStudyAnalyticsEventName,
  ContentStudyMetrics,
  ContentSourceType,
  ContentStudyErrorCode,
} from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { getDefaultStorageAdapter } from "../../persistence";
import { createDebugger } from "../../utils/debug";
const getStorage = () => getDefaultStorageAdapter();
const debug = createDebugger("content-study:analytics");
export class ContentStudyAnalyticsService {
  private static instance: ContentStudyAnalyticsService;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private queue: ContentStudyAnalyticsEvent[] = [];
  private isOnline = true;
  private analyticsProvider?: {
    track: (event: string, properties: Record<string, unknown>) => void;
    identify: (userId: string, traits?: Record<string, unknown>) => void;
  };
  static getInstance(): ContentStudyAnalyticsService {
    if (!ContentStudyAnalyticsService.instance) {
      ContentStudyAnalyticsService.instance =
        new ContentStudyAnalyticsService();
    }
    return ContentStudyAnalyticsService.instance;
  }
  initialize(
    userId: string,
    provider?: {
      track: (event: string, properties: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
    },
  ): void {
    this.userId = userId;
    this.analyticsProvider = provider;
    this.sessionId = this.generateSessionId();
    if (provider) {
      provider.identify(userId, { feature: "content-study" });
    }
    this.flushQueue();
  }
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.flushQueue();
    }
  }
  track(
    eventName: ContentStudyAnalyticsEventName,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.userId) {
      return;
    }
    const event: ContentStudyAnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId || undefined,
      properties,
      context: {
        appVersion: "1.0.0",
        platform: "mobile",
        screenSize: "default",
        isOnline: this.isOnline,
      },
    };
    if (this.isOnline && this.analyticsProvider) {
      this.sendToProvider(event);
    } else {
      this.queue.push(event);
      this.persistQueue();
    }
  }
  private sendToProvider(event: ContentStudyAnalyticsEvent): void {
    if (!this.analyticsProvider) {
      return;
    }
    try {
      this.analyticsProvider.track(event.eventName, {
        ...event.properties,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        context: event.context,
      });
    } catch (e) {
      debug.error("Analytics tracking error:", e as Error);
      this.queue.push(event);
    }
  }
  private async persistQueue(): Promise<void> {
    try {
      await getStorage().setItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:analytics-queue`,
        JSON.stringify(this.queue),
      );
    } catch (e) {
      debug.error("Failed to persist analytics queue:", e as Error);
    }
  }
  private async flushQueue(): Promise<void> {
    if (!this.analyticsProvider || this.queue.length === 0) {
      return;
    }
    const failed: ContentStudyAnalyticsEvent[] = [];
    for (const event of this.queue) {
      try {
        this.sendToProvider(event);
      } catch (error) {
        captureSilentFailure(error, {
          feature: "content-study",
          operation: "ui-fallback",
          type: "ui",
        });
        failed.push(event);
      }
    }
    this.queue = failed;
    await this.persistQueue();
  }
  private generateSessionId(): string {
    return `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  private metrics: Partial<ContentStudyMetrics> = {};
  updateMetrics(updates: Partial<ContentStudyMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }
  getMetrics(): Partial<ContentStudyMetrics> {
    return this.metrics;
  }
  async loadPersistedMetrics(): Promise<void> {
    try {
      const data = await getStorage().getItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
      );
      if (data) {
        this.metrics = JSON.parse(data);
      }
    } catch (error) {
      captureSilentFailure(error, {
        feature: "content-study",
        operation: "ui-fallback",
        type: "ui",
      });
    }
  }
  async persistMetrics(): Promise<void> {
    try {
      await getStorage().setItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
        JSON.stringify(this.metrics),
      );
    } catch (error) {
      captureSilentFailure(error, {
        feature: "content-study",
        operation: "ui-fallback",
        type: "ui",
      });
    }
  }
}
export const contentStudyAnalytics = ContentStudyAnalyticsService.getInstance();
export const analytics = {
  inputOpened(preferredTab?: string): void {
    contentStudyAnalytics.track("content_study_input_opened", {
      preferred_tab: preferredTab,
    });
  },
  tabSwitched(from: string, to: string): void {
    contentStudyAnalytics.track("content_study_tab_switched", {
      from_tab: from,
      to_tab: to,
    });
  },
  textPasted(characterCount: number, wordCount: number): void {
    contentStudyAnalytics.track("content_study_text_pasted", {
      character_count: characterCount,
      word_count: wordCount,
      estimated_read_time: Math.ceil(wordCount / 200),
    });
  },
  fileSelected(fileType: string, fileSize: number, fileName: string): void {
    contentStudyAnalytics.track("content_study_file_selected", {
      file_type: fileType,
      file_size_bytes: fileSize,
      file_size_mb: Math.round((fileSize / (1024 * 1024)) * 100) / 100,
      file_name_hash: hashString(fileName),
    });
  },
  youtubeEntered(url: string, isValid: boolean): void {
    contentStudyAnalytics.track("content_study_youtube_entered", {
      url_valid: isValid,
      url_length: url.length,
    });
  },
  submitted(
    type: ContentSourceType,
    validationResult: {
      isValid: boolean;
      errorCount: number;
      warningCount: number;
    },
  ): void {
    contentStudyAnalytics.track("content_study_submitted", {
      source_type: type,
      validation_passed: validationResult.isValid,
      validation_errors: validationResult.errorCount,
      validation_warnings: validationResult.warningCount,
    });
  },
  extractionStarted(contentId: string, sourceType: ContentSourceType): void {
    contentStudyAnalytics.track("content_study_extraction_started", {
      content_id: contentId,
      source_type: sourceType,
    });
  },
  extractionProgress(contentId: string, progress: number, stage: string): void {
    contentStudyAnalytics.track("content_study_extraction_progress", {
      content_id: contentId,
      progress_percent: progress,
      stage,
    });
  },
  extractionCompleted(
    contentId: string,
    sourceType: ContentSourceType,
    extractedLength: number,
    durationMs: number,
  ): void {
    contentStudyAnalytics.track("content_study_extraction_completed", {
      content_id: contentId,
      source_type: sourceType,
      extracted_length: extractedLength,
      duration_ms: durationMs,
      success: true,
    });
  },
  extractionFailed(
    contentId: string,
    errorCode: ContentStudyErrorCode,
    retryAttempt: number,
  ): void {
    contentStudyAnalytics.track("content_study_extraction_failed", {
      content_id: contentId,
      error_code: errorCode,
      retry_attempt: retryAttempt,
      will_retry: retryAttempt < CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS,
    });
  },
  reviewOpened(contentId: string, sourceType: ContentSourceType): void {
    contentStudyAnalytics.track("content_study_review_opened", {
      content_id: contentId,
      source_type: sourceType,
    });
  },
  textEdited(
    contentId: string,
    editType: "insert" | "delete" | "replace",
    editLength: number,
  ): void {
    contentStudyAnalytics.track("content_study_text_edited", {
      content_id: contentId,
      edit_type: editType,
      edit_length: editLength,
    });
  },
  generationStarted(contentId: string): void {
    contentStudyAnalytics.track("content_study_generation_started", {
      content_id: contentId,
    });
  },
  generationCompleted(
    generationId: string,
    taskCount: number,
    quizCount: number,
    durationMs: number,
    model: string,
  ): void {
    contentStudyAnalytics.track("content_study_generation_completed", {
      generation_id: generationId,
      task_count: taskCount,
      quiz_count: quizCount,
      duration_ms: durationMs,
      model,
    });
  },
  generationFailed(
    contentId: string,
    errorCode: ContentStudyErrorCode,
    retryAttempt: number,
  ): void {
    contentStudyAnalytics.track("content_study_generation_failed", {
      content_id: contentId,
      error_code: errorCode,
      retry_attempt: retryAttempt,
    });
  },
  planViewed(generationId: string, viewDurationMs: number): void {
    contentStudyAnalytics.track("content_study_plan_viewed", {
      generation_id: generationId,
      view_duration_ms: viewDurationMs,
    });
  },
  taskViewed(generationId: string, taskId: string, taskIndex: number): void {
    contentStudyAnalytics.track("content_study_task_viewed", {
      generation_id: generationId,
      task_id: taskId,
      task_index: taskIndex,
    });
  },
  taskCompleted(
    generationId: string,
    taskId: string,
    taskIndex: number,
    timeSpentMs: number,
  ): void {
    contentStudyAnalytics.track("content_study_task_completed", {
      generation_id: generationId,
      task_id: taskId,
      task_index: taskIndex,
      time_spent_ms: timeSpentMs,
    });
  },
  quizViewed(generationId: string, quizId: string, quizIndex: number): void {
    contentStudyAnalytics.track("content_study_quiz_viewed", {
      generation_id: generationId,
      quiz_id: quizId,
      quiz_index: quizIndex,
    });
  },
  quizAnswered(
    generationId: string,
    quizId: string,
    isCorrect: boolean,
    timeSpentMs: number,
    difficulty: string,
  ): void {
    contentStudyAnalytics.track("content_study_quiz_answered", {
      generation_id: generationId,
      quiz_id: quizId,
      is_correct: isCorrect,
      time_spent_ms: timeSpentMs,
      difficulty,
    });
  },
  sessionStarted(
    generationId: string,
    sessionConfig: {
      duration: number;
      difficulty: string;
      focus_areas: string[];
    },
  ): void {
    contentStudyAnalytics.track("content_study_session_started", {
      generation_id: generationId,
      duration_seconds: sessionConfig.duration,
      difficulty: sessionConfig.difficulty,
      focus_area_count: sessionConfig.focus_areas.length,
    });
  },
  sessionCompleted(
    generationId: string,
    actualDurationMs: number,
    interruptions: number,
    tasksCompleted: number,
  ): void {
    contentStudyAnalytics.track("content_study_session_completed", {
      generation_id: generationId,
      actual_duration_ms: actualDurationMs,
      interruptions,
      tasks_completed: tasksCompleted,
    });
  },
  feedbackSubmitted(
    generationId: string,
    rating: number,
    timeSinceGenerationMs: number,
  ): void {
    contentStudyAnalytics.track("content_study_feedback_submitted", {
      generation_id: generationId,
      rating,
      time_since_generation_ms: timeSinceGenerationMs,
    });
  },
  rateLimited(remaining: number, resetsAt: number): void {
    contentStudyAnalytics.track("content_study_rate_limited", {
      remaining_generations: remaining,
      resets_at: resetsAt,
      hours_until_reset: Math.ceil((resetsAt - Date.now()) / (1000 * 60 * 60)),
    });
  },
  offlineMode(reason: "user_initiated" | "network_loss" | "forced"): void {
    contentStudyAnalytics.track("content_study_offline_mode", { reason });
  },
  error(
    errorCode: ContentStudyErrorCode,
    context: string,
    recoverable: boolean,
  ): void {
    contentStudyAnalytics.track("content_study_error", {
      error_code: errorCode,
      context,
      recoverable,
    });
  },
};
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
export async function calculateMetrics(
  userId: string,
): Promise<Partial<ContentStudyMetrics>> {
  return {
    totalContentsSubmitted: 0,
    bySourceType: { PASTE: 0, PDF: 0, YOUTUBE: 0, URL: 0 },
    averageContentLength: 0,
    averageExtractionTime: 0,
    extractionSuccessRate: 0,
    totalGenerations: 0,
    averageGenerationTime: 0,
    generationSuccessRate: 0,
    averageTasksPerGeneration: 0,
    averageQuizItemsPerGeneration: 0,
    averageSessionDuration: 0,
    taskCompletionRate: 0,
    quizAccuracyRate: 0,
    averageUserRating: 0,
    returnRate: 0,
    errorRateByType: {} as Record<ContentStudyErrorCode, number>,
    retrySuccessRate: 0,
  };
}
import { useCallback, useRef } from "react";
export function useContentStudyAnalytics() {
  const trackRef = useRef(analytics);
  trackRef.current = analytics;
  const trackEvent = useCallback(
    <K extends keyof typeof analytics>(
      event: K,
      ...args: Parameters<(typeof analytics)[K]>
    ) => {
      const tracker = trackRef.current[event];
      if (tracker) {
        (tracker as (...args: unknown[]) => void)(...args);
      }
    },
    [],
  );
  return {
    track: trackEvent,
    analytics: trackRef.current,
    initialize: useCallback(
      (
        userId: string,
        provider?: {
          track: (event: string, properties: Record<string, unknown>) => void;
          identify: (userId: string, traits?: Record<string, unknown>) => void;
        },
      ) => {
        contentStudyAnalytics.initialize(userId, provider);
      },
      [],
    ),
  };
}
