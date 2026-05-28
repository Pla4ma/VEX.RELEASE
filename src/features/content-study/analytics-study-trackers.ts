/**
 * Content Study Session & System Trackers
 *
 * Analytics convenience methods for study plan/task/quiz interactions,
 * session management, and system-level events.
 */

import type { ContentStudyErrorCode } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { contentStudyAnalytics } from "./analytics-service";

export const studyTrackers = {
  planViewed(generationId: string, viewDurationMs: number): void {
    contentStudyAnalytics.track("content_study_plan_viewed", {
      generation_id: generationId,
      view_duration_ms: viewDurationMs,
    });
  },
  taskViewed(
    generationId: string,
    taskId: string,
    taskIndex: number,
  ): void {
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
  quizViewed(
    generationId: string,
    quizId: string,
    quizIndex: number,
  ): void {
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
      hours_until_reset: Math.ceil(
        (resetsAt - Date.now()) / (1000 * 60 * 60),
      ),
    });
  },
  offlineMode(
    reason: "user_initiated" | "network_loss" | "forced",
  ): void {
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
