/**
 * Content Study State Types
 * UI state types for content study feature
 */

import type { ExtractionStage, InputTab } from './enums';
import type { StudyContent, StudyGeneration } from './content';
import type { SessionDifficulty } from './enums';

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type ErrorRecoveryAction =
  | 'retry'
  | 'refresh'
  | 'reupload'
  | 'edit_content'
  | 'contact_support'
  | 'try_again_later'
  | 'use_fallback'
  | 'go_back'
  | 'none';

export interface TextEdit {
  timestamp: number;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  oldText?: string;
  newText?: string;
}

export interface ContentInputState {
  activeTab: InputTab;
  pastedText: string;
  youtubeUrl: string;
  selectedFile: {
    uri: string;
    name: string;
    size: number;
    type: string;
  } | null;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  isValid: boolean;
  characterCount: number;
  lastAutoSave?: number;
  draftId?: string;
}

export interface ContentReviewState {
  content: StudyContent | null;
  editedText: string;
  isEditing: boolean;
  isGenerating: boolean;
  error: string | null;
  originalText: string;
  editHistory: TextEdit[];
  canUndo: boolean;
  canRedo: boolean;
  wordCount: number;
  isExtracting: boolean;
  extractionProgress: number;
  extractionStage: ExtractionStage;
  retryCount: number;
  lastSavedAt?: number;
  autosaveEnabled: boolean;
}

export interface StudyPlanState {
  generation: StudyGeneration | null;
  content: StudyContent | null;
  isLoading: boolean;
  error: string | null;
  activeTaskId: string | null;
  activeQuizId: string | null;
  completedTaskIds: Set<string>;
  answeredQuizIds: Set<string>;
  quizAnswers: Record<
    string,
    { answer: string; isCorrect?: boolean; timestamp: number }
  >;
  isStartingSession: boolean;
  sessionPreparationData?: SessionPreparationData;
  showRatingModal: boolean;
  hasRated: boolean;
  expandedSections: Set<string>;
  studyStartTime?: number;
  totalStudyTime: number;
  focusAreaProgress: Record<string, { completed: number; total: number }>;
}

export interface SessionPreparationData {
  duration: number;
  difficulty: SessionDifficulty;
  goal: string;
  focusAreas: string[];
  preSessionQuizResults?: {
    score: number;
    total: number;
  };
}
