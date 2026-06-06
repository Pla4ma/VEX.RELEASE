import { z } from 'https://esm.sh/zod@3.22.4';

export const SubmitContentSchema = z.object({
  type: z.enum(['PASTE', 'PDF', 'YOUTUBE']),
  content: z.string().max(50000, 'Content exceeds maximum length of 50,000 characters'),
  title: z.string().max(500).optional(),
  filename: z.string().max(255).optional(),
});

export const GenerateStudyPlanSchema = z.object({
  contentId: z.string().uuid(),
});

export const SubmitFeedbackSchema = z.object({
  generationId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  wasHelpful: z.boolean().optional(),
});

export interface StudyTask {
  id: string;
  content: string;
  estimatedMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dependsOn?: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  conceptTag: string;
}

export interface SessionPlan {
  recommendedDuration: number;
  recommendedSessions: number;
  breakIntervalMinutes: number;
  suggestedDifficulty: 'EASY' | 'NORMAL' | 'CHALLENGING';
  focusAreas: string[];
}

export interface RawStudyTask {
  id?: unknown;
  content?: unknown;
  estimatedMinutes?: unknown;
  priority?: unknown;
  dependsOn?: unknown;
}

export interface RawQuizItem {
  id?: unknown;
  question?: unknown;
  answer?: unknown;
  options?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  conceptTag?: unknown;
}

export interface RawSessionPlan {
  recommendedDuration?: unknown;
  recommendedSessions?: unknown;
  breakIntervalMinutes?: unknown;
  suggestedDifficulty?: unknown;
  focusAreas?: unknown;
}

export interface RawStudyPlanResponse {
  summary?: unknown;
  keyConcepts?: unknown;
  tasks?: unknown;
  quizItems?: unknown;
  sessionPlan?: RawSessionPlan;
}
