/**
 * Content Study Content Types
 * StudyContent and StudyGeneration entity types
 */

import type { ContentSourceType, ContentStatus } from './enums';
import type { StudyTask, QuizItem, SessionPlan, KeyConcept, StudySummary } from './domain';

export interface StudyContent {
  id: string;
  userId: string;
  sourceType: ContentSourceType;
  sourceUrl?: string;
  originalFilename?: string;
  storagePath?: string;
  title?: string;
  extractedText: string;
  extractedLength: number;
  language: string;
  userEditedText?: string;
  isUserEdited: boolean;
  status: ContentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  lastGenerationDate?: string;
  generationCount: number;
  extractedAt?: string;
}

export interface StudyGeneration {
  id: string;
  contentId: string;
  userId: string;
  summary: StudySummary;
  keyConcepts: KeyConcept[];
  tasks: StudyTask[];
  quizItems: QuizItem[];
  sessionPlan: SessionPlan;
  metadata: {
    contentLength: number;
    processingTimeMs: number;
    modelVersion: string;
    confidenceScore: number;
  };
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  isArchived: boolean;
}
