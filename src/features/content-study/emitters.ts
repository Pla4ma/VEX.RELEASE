import type { ContentStudyEventMap } from "./types";
import { EventEmitter } from "./EventEmitter";

export const contentStudyEvents = new EventEmitter<ContentStudyEventMap>();

export function emitDraftSaved(draftId: string): void {
  contentStudyEvents.emit("content-study:draft-saved", {
    draftId,
    timestamp: Date.now(),
  });
}

export function emitContentSubmitted(
  contentId: string,
  type: ContentStudyEventMap["content-study:content-submitted"]["type"],
): void {
  contentStudyEvents.emit("content-study:content-submitted", {
    contentId,
    type,
  });
}

export function emitExtractionStarted(
  contentId: string,
  stage: ContentStudyEventMap["content-study:extraction-started"]["stage"],
): void {
  contentStudyEvents.emit("content-study:extraction-started", {
    contentId,
    stage,
  });
}

export function emitExtractionProgress(
  contentId: string,
  progress: number,
  stage: ContentStudyEventMap["content-study:extraction-progress"]["stage"],
): void {
  contentStudyEvents.emit("content-study:extraction-progress", {
    contentId,
    progress,
    stage,
  });
}

export function emitExtractionComplete(
  contentId: string,
  extractedLength: number,
): void {
  contentStudyEvents.emit("content-study:extraction-complete", {
    contentId,
    extractedLength,
  });
}

export function emitExtractionFailed(
  contentId: string,
  error: ContentStudyEventMap["content-study:extraction-failed"]["error"],
): void {
  contentStudyEvents.emit("content-study:extraction-failed", {
    contentId,
    error,
  });
}

export function emitGenerationStarted(
  contentId: string,
  generationId: string,
): void {
  contentStudyEvents.emit("content-study:generation-started", {
    contentId,
    generationId,
  });
}

export function emitGenerationComplete(
  generationId: string,
  taskCount: number,
  quizCount: number,
): void {
  contentStudyEvents.emit("content-study:generation-complete", {
    generationId,
    taskCount,
    quizCount,
  });
}

export function emitGenerationFailed(
  contentId: string,
  error: ContentStudyEventMap["content-study:generation-failed"]["error"],
): void {
  contentStudyEvents.emit("content-study:generation-failed", {
    contentId,
    error,
  });
}

export function emitTaskCompleted(generationId: string, taskId: string): void {
  contentStudyEvents.emit("content-study:task-completed", {
    generationId,
    taskId,
    completedAt: Date.now(),
  });
}

export function emitQuizAnswered(
  generationId: string,
  quizId: string,
  isCorrect: boolean,
): void {
  contentStudyEvents.emit("content-study:quiz-answered", {
    generationId,
    quizId,
    isCorrect,
  });
}

export function emitSessionStarted(
  generationId: string,
  sessionConfig: ContentStudyEventMap["content-study:session-started"]["sessionConfig"],
): void {
  contentStudyEvents.emit("content-study:session-started", {
    generationId,
    sessionConfig,
  });
}

export function emitSessionEnded(
  generationId: string,
  duration: number,
  rating?: number,
): void {
  contentStudyEvents.emit("content-study:session-ended", {
    generationId,
    duration,
    rating,
  });
}

export function emitFeedbackSubmitted(
  generationId: string,
  rating: number,
): void {
  contentStudyEvents.emit("content-study:feedback-submitted", {
    generationId,
    rating,
  });
}

export function emitContentDeleted(contentId: string): void {
  contentStudyEvents.emit("content-study:content-deleted", { contentId });
}

export function emitRateLimitHit(
  userId: string,
  remaining: number,
  resetsAt: number,
): void {
  contentStudyEvents.emit("content-study:rate-limit-hit", {
    userId,
    remaining,
    resetsAt,
  });
}

export function emitOfflineSyncStarted(queueLength: number): void {
  contentStudyEvents.emit("content-study:offline-sync-started", {
    queueLength,
  });
}

export function emitOfflineSyncComplete(synced: number, failed: number): void {
  contentStudyEvents.emit("content-study:offline-sync-complete", {
    synced,
    failed,
  });
}
