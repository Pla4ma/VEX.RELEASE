/**
 * Content Study Zod Schemas
 */

import { z } from "zod";
import { ContentSourceTypeSchema, ContentStatusSchema } from "./enums";

export const StudyContentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceType: ContentSourceTypeSchema,
  sourceUrl: z.string().optional(),
  originalFilename: z.string().optional(),
  storagePath: z.string().optional(),
  title: z.string().optional(),
  extractedText: z.string(),
  extractedLength: z.number(),
  language: z.string(),
  userEditedText: z.string().optional(),
  isUserEdited: z.boolean(),
  status: ContentStatusSchema,
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastGenerationDate: z.string().optional(),
  generationCount: z.number(),
  extractedAt: z.string().optional(),
});

export const StudyGenerationSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  userId: z.string(),
  summary: z.object({
    overview: z.string(),
    keyPoints: z.array(z.string()),
    targetAudience: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
  }),
  keyConcepts: z.array(
    z.object({
      id: z.string(),
      term: z.string(),
      definition: z.string(),
      importance: z.number(),
    }),
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      estimatedMinutes: z.number(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      dependsOn: z.array(z.string()).optional(),
    }),
  ),
  quizItems: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      options: z.array(z.string()).optional(),
      explanation: z.string().optional(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
      conceptTag: z.string(),
    }),
  ),
  sessionPlan: z.object({
    recommendedDuration: z.number(),
    recommendedSessions: z.number(),
    breakIntervalMinutes: z.number(),
    suggestedDifficulty: z.enum(["EASY", "NORMAL", "CHALLENGING"]),
    focusAreas: z.array(z.string()),
  }),
  metadata: z.object({
    contentLength: z.number(),
    processingTimeMs: z.number(),
    modelVersion: z.string(),
    confidenceScore: z.number(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastAccessedAt: z.string().optional(),
  accessCount: z.number(),
  isArchived: z.boolean(),
});

export const SubmitFeedbackRequestSchema = z.object({
  generationId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  helpful: z.boolean(),
});

export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackRequestSchema>;
