/**
 * Content Study Enums
 * Zod schemas and type definitions for enums
 */

import { z } from 'zod';

export const ContentSourceTypeSchema = z.enum([
  'PASTE',
  'PDF',
  'YOUTUBE',
  'URL',
]);
export type ContentSourceType = z.infer<typeof ContentSourceTypeSchema>;

export const ContentStatusSchema = z.enum([
  'PENDING',
  'EXTRACTING',
  'EXTRACTED',
  'PROCESSING',
  'READY',
  'FAILED',
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const TaskPrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const QuizDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;

export const SessionDifficultySchema = z.enum([
  'EASY',
  'NORMAL',
  'CHALLENGING',
]);
export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;

export type InputTab = 'paste' | 'pdf' | 'youtube';

export type ExtractionStage =
  | 'uploading'
  | 'processing'
  | 'extracting'
  | 'analyzing'
  | 'complete'
  | 'failed';

export const CONTENT_STUDY_CONSTANTS = {
  MAX_CONTENT_LENGTH: 50000,
  MIN_CONTENT_LENGTH: 100,
  MAX_PASTE_LENGTH: 50000,
  MIN_PASTE_LENGTH: 100,
  MAX_FILE_SIZE_MB: 50,
  MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_YOUTUBE_URL_LENGTH: 500,
  MAX_TITLE_LENGTH: 200,
  SUPPORTED_PDF_TYPES: ['application/pdf'],
  SUPPORTED_TEXT_TYPES: ['text/plain', 'text/markdown'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  DAILY_GENERATION_LIMIT: 10,
  EXTRACTION_TIMEOUT_MS: 5 * 60 * 1000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  LOCAL_STORAGE_KEY: 'vex:content-study',
  DRAFT_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  AUTOSAVE_INTERVAL_MS: 30 * 1000, // 30 seconds
  OFFLINE_QUEUE_MAX_SIZE: 100,
  MAX_STATUS_POLL_ATTEMPTS: 60, // 60 attempts
  STATUS_POLL_INTERVAL_MS: 5000, // 5 seconds
} as const;
