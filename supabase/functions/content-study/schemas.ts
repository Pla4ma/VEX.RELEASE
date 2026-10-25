import { z } from "https://esm.sh/zod@3.22.4";
import { isStudyYouTubeUrl } from "./youtube-video.ts";

export const SubmitContentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("PASTE"),
    content: z
      .string()
      .min(100, "Content must be at least 100 characters")
      .max(50000, "Content exceeds maximum length of 50,000 characters"),
    title: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("PDF"),
    fileId: z.string().min(1).max(512),
    filename: z.string().max(255).optional(),
    title: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("YOUTUBE"),
    url: z.string().url().refine(
      isStudyYouTubeUrl,
      "Expected a supported YouTube video URL",
    ),
    title: z.string().max(500).optional(),
  }),
]);
export type SubmitContent = z.infer<typeof SubmitContentSchema>;

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
  priority: "HIGH" | "MEDIUM" | "LOW";
  dependsOn?: string[];
}

export interface QuizItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  conceptTag: string;
}

export interface SessionPlan {
  recommendedDuration: number;
  recommendedSessions: number;
  breakIntervalMinutes: number;
  suggestedDifficulty: "EASY" | "NORMAL" | "CHALLENGING";
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
export const StudyPlanModelResponseSchema = z.object({
  summary: z.string().trim().min(1),
  keyConcepts: z.array(z.string().trim().min(1)).min(1),
  tasks: z.array(z.object({
    id: z.string().optional(),
    content: z.string().trim().min(1),
    estimatedMinutes: z.number().optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
    dependsOn: z.array(z.string()).optional(),
  })).min(1),
  quizItems: z.array(z.object({
    id: z.string().optional(),
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
    options: z.array(z.string()).optional(),
    explanation: z.string().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    conceptTag: z.string().optional(),
  })).min(1),
  sessionPlan: z.object({
    recommendedDuration: z.number().optional(),
    recommendedSessions: z.number().optional(),
    breakIntervalMinutes: z.number().optional(),
    suggestedDifficulty: z.enum(["EASY", "NORMAL", "CHALLENGING"]).optional(),
    focusAreas: z.array(z.string()).optional(),
  }).optional(),
});
export type StudyPlanModelResponse = z.infer<typeof StudyPlanModelResponseSchema>;
