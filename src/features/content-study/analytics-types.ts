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
