/**
 * Study Session Types
 *
 * Extended session types for document-linked study sessions.
 * Phase 1: Content Study Unification
 */

import type { SessionState } from './index';

// ============================================================================
// Document Linking
// ============================================================================

export interface LinkedDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'TEXT' | 'URL' | 'OTHER';
  totalPages?: number;
  currentPage: number;
  sections?: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  name: string;
  pageStart: number;
  pageEnd: number;
  completed: boolean;
  timeSpentSeconds: number;
}

// ============================================================================
// Study Session Tracking
// ============================================================================

export interface StudySessionMetrics {
  documentId: string;
  pagesRead: number;
  highlightsMade: number;
  notesTaken: number;
  flashcardsCreated: number;
  timePerPage: number; // average seconds
  sectionProgress: SectionProgress[];
}

export interface SectionProgress {
  sectionId: string;
  percentComplete: number;
  timeSpentSeconds: number;
  lastAccessedAt: number;
}

export interface Highlight {
  id: string;
  page: number;
  text: string;
  note?: string;
  color: 'YELLOW' | 'GREEN' | 'BLUE' | 'PINK';
  createdAt: number;
}

export interface StudyNote {
  id: string;
  page: number;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Study Session State Extension
// ============================================================================

export interface StudySessionState extends SessionState {
  mode: 'STUDY';
  document?: LinkedDocument;
  studyMetrics: StudySessionMetrics;
  highlights: Highlight[];
  notes: StudyNote[];
  currentSectionId?: string;
  lastInteractionAt: number;
}

// ============================================================================
// Study Session Configuration
// ============================================================================

export interface StudySessionConfig {
  documentId?: string;
  documentName?: string;
  readingGoal?: {
    pages: number;
    timeMinutes: number;
  };
  enableAIAssistance: boolean;
  autoGenerateFlashcards: boolean;
  trackHighlights: boolean;
}

// ============================================================================
// Study Session Events
// ============================================================================

export interface StudySessionEvent {
  type: 'PAGE_CHANGE' | 'HIGHLIGHT_CREATED' | 'NOTE_ADDED' | 'SECTION_COMPLETED' | 'AI_HELP_REQUESTED';
  timestamp: number;
  data: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isStudySession(session: SessionState): session is StudySessionState {
  // STUDY mode archived - check for study metrics instead
  return (session as StudySessionState).studyMetrics !== undefined;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(
  currentPage: number,
  totalPages: number
): number {
  if (!totalPages || totalPages <= 0) {return 0;}
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}

/**
 * Calculate average reading speed (pages per hour)
 */
export function calculateReadingSpeed(
  pagesRead: number,
  timeSpentSeconds: number
): number {
  if (!timeSpentSeconds || timeSpentSeconds <= 0) {return 0;}
  const hours = timeSpentSeconds / 3600;
  if (hours <= 0) {return 0;}
  return Math.round(pagesRead / hours * 10) / 10;
}

/**
 * Estimate time to finish reading
 */
export function estimateTimeToFinish(
  remainingPages: number,
  averageTimePerPage: number
): number {
  return remainingPages * averageTimePerPage;
}

/**
 * Check if user is stuck on a section
 */
export function isStuckOnSection(
  sectionProgress: SectionProgress,
  thresholdSeconds: number = 30 * 60
): boolean {
  return sectionProgress.timeSpentSeconds > thresholdSeconds &&
         sectionProgress.percentComplete < 50;
}
