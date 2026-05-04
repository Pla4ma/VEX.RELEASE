/**
 * Content Study Input/Output Types
 * API request/response types and Zod schemas
 */

import { z } from 'zod';

export const SubmitContentRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PASTE'),
    content: z.string().min(100).max(50000),
  }),
  z.object({
    type: z.literal('PDF'),
    fileId: z.string(),
  }),
  z.object({
    type: z.literal('YOUTUBE'),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal('URL'),
    url: z.string().url(),
  }),
]);

export type SubmitContentRequest = z.infer<typeof SubmitContentRequestSchema>;

export interface SubmitContentResponse {
  contentId: string;
  status: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'PROCESSING' | 'READY' | 'FAILED';
  message?: string;
}

export interface ExtractContentResponse {
  contentId: string;
  status: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'PROCESSING' | 'READY' | 'FAILED';
  success: boolean;
  error?: string;
  extractedLength?: number;
  errorMessage?: string;
  generation?: unknown;
}

export interface GenerateStudyPlanRequest {
  contentId: string;
  userId: string;
  config?: {
    taskCount?: number;
    quizCount?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    focusAreas?: string[];
  };
}

export interface GenerateStudyPlanResponse {
  generationId: string;
  contentId: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  estimatedTimeMs?: number;
}

export interface UpdateContentTextRequest {
  text: string;
  reason?: 'user_edit' | 'correction';
}

export interface ContentHistoryFilters {
  sourceType?: 'PASTE' | 'PDF' | 'YOUTUBE' | 'URL' | 'all';
  status?: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'PROCESSING' | 'READY' | 'FAILED' | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}
