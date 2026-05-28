/**
 * Content Study Input & Generation Trackers
 *
 * Analytics convenience methods for content input, extraction,
 * review, and generation lifecycle events.
 */

import type { ContentSourceType, ContentStudyErrorCode } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { contentStudyAnalytics } from "./analytics-service";

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const inputTrackers = {
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
  extractionProgress(
    contentId: string,
    progress: number,
    stage: string,
  ): void {
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
};
