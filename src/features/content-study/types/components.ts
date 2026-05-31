/**
 * Content Study Component Props Types
 * Props for content study UI components
 */

import type { ContentSourceType, InputTab, ExtractionStage } from './enums';
import type { StudyTask, SessionPlan } from './domain';
import type { ValidationError, SessionPreparationData } from './state';

export enum ContentStudyErrorCode {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  PDF_PARSE_ERROR = 'PDF_PARSE_ERROR',
  YOUTUBE_TRANSCRIPT_ERROR = 'YOUTUBE_TRANSCRIPT_ERROR',
  INVALID_YOUTUBE_URL = 'INVALID_YOUTUBE_URL',
  CONTENT_EXPIRED = 'CONTENT_EXPIRED',
  SESSION_INTERRUPTED = 'SESSION_INTERRUPTED',
  OFFLINE_MODE = 'OFFLINE_MODE',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface ContentStudyError {
  code: ContentStudyErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
  retryAfter?: number;
  timestamp?: number;
  recoverable?: boolean;
  suggestedAction?: string;
}

export interface InputTypeSelectorProps {
  activeTab: InputTab;
  onTabChange: (tab: InputTab) => void;
  disabled?: boolean;
  hasDrafts?: Record<InputTab, boolean>;
}

export interface TextPasteInputProps {
  value: string;
  onChange: (text: string) => void;
  onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onAutoSave?: (text: string) => void;
  showCharacterCount?: boolean;
  showMinLengthIndicator?: boolean;
}

export interface PdfUploaderProps {
  selectedFile: {
    uri: string;
    name: string;
    size: number;
    type: string;
  } | null;
  onFileSelect: (
    file: { uri: string; name: string; size: number; type: string } | null,
  ) => void;
  disabled?: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  onRetry?: () => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export interface YouTubeInputProps {
  value: string;
  onChange: (url: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  disabled?: boolean;
  onExtract?: () => void;
  isExtracting?: boolean;
  extractionError?: string | null;
  videoInfo?: {
    title?: string;
    duration?: number;
    thumbnail?: string;
    channelName?: string;
  } | null;
}

export interface ExtractionProgressProps {
  stage: ExtractionStage;
  progress: number;
  contentType: ContentSourceType;
  estimatedTimeRemaining?: number;
  onCancel?: () => void;
  error?: ContentStudyError | null;
  onRetry?: () => void;
}

export interface StudyTaskListProps {
  tasks: StudyTask[];
  completedIds: Set<string>;
  activeId: string | null;
  onTaskComplete: (taskId: string) => void;
  onTaskSelect: (taskId: string) => void;
  showDependencies?: boolean;
  readOnly?: boolean;
  estimatedTotalTime: number;
  completedTime: number;
}

export interface QuizPanelProps {
  items: QuizItemProps[];
  answers: Record<
    string,
    { answer: string; isCorrect?: boolean; timestamp: number }
  >;
  activeId: string | null;
  onAnswer: (quizId: string, answer: string) => void;
  onRevealAnswer: (quizId: string) => void;
  showResults?: boolean;
  score?: { correct: number; total: number };
  readOnly?: boolean;
}

export interface QuizItemProps {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  conceptTag: string;
}

export interface SessionPrepPanelProps {
  sessionPlan: SessionPlan;
  onStartSession: () => void;
  onAdjustDuration: (duration: number) => void;
  onAdjustDifficulty: (difficulty: 'EASY' | 'NORMAL' | 'CHALLENGING') => void;
  isStarting?: boolean;
  preSessionQuizResults?: SessionPreparationData['preSessionQuizResults'];
  suggestedFocusAreas?: string[];
}
