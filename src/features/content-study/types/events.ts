import type { ContentSourceType, ExtractionStage } from "./enums";
import type { ContentStudyError } from "./components";
import type { SessionPreparationData } from "./state";

// Event Map for content-study events
export interface ContentStudyEventMap {
  "content-study:draft-saved": { draftId: string; timestamp: number };
  "content-study:content-submitted": {
    contentId: string;
    type: ContentSourceType;
  };
  "content-study:extraction-started": {
    contentId: string;
    stage: ExtractionStage;
  };
  "content-study:extraction-progress": {
    contentId: string;
    progress: number;
    stage: ExtractionStage;
  };
  "content-study:extraction-complete": {
    contentId: string;
    extractedLength: number;
  };
  "content-study:extraction-failed": {
    contentId: string;
    error: ContentStudyError;
  };
  "content-study:generation-started": {
    contentId: string;
    generationId: string;
  };
  "content-study:generation-complete": {
    generationId: string;
    taskCount: number;
    quizCount: number;
  };
  "content-study:generation-failed": {
    contentId: string;
    error: ContentStudyError;
  };
  "content-study:task-completed": {
    generationId: string;
    taskId: string;
    completedAt: number;
  };
  "content-study:quiz-answered": {
    generationId: string;
    quizId: string;
    isCorrect: boolean;
  };
  "content-study:session-started": {
    generationId: string;
    sessionConfig: SessionPreparationData;
  };
  "content-study:session-ended": {
    generationId: string;
    duration: number;
    rating?: number;
  };
  "content-study:feedback-submitted": { generationId: string; rating: number };
  "content-study:content-deleted": { contentId: string };
  "content-study:rate-limit-hit": {
    userId: string;
    remaining: number;
    resetsAt: number;
  };
  "content-study:offline-sync-started": { queueLength: number };
  "content-study:offline-sync-complete": { synced: number; failed: number };
}
