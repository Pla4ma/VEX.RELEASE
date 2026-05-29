import { z } from "zod";
import {
  StudyContentSchema,
  StudyGenerationSchema,
} from "./types";

export const contentRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  source_type: z.enum(["PASTE", "PDF", "YOUTUBE", "URL"]),
  source_url: z.string().nullable().optional(),
  original_filename: z.string().nullable().optional(),
  storage_path: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  extracted_text: z.string().default(""),
  extracted_length: z.number().default(0),
  language: z.string().default("en"),
  user_edited_text: z.string().nullable().optional(),
  is_user_edited: z.boolean().default(false),
  status: z.enum([
    "PENDING",
    "EXTRACTING",
    "EXTRACTED",
    "PROCESSING",
    "READY",
    "FAILED",
  ]),
  error_message: z.string().nullable().optional(),
  generation_count_today: z.number().default(0),
  last_generation_date: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  extracted_at: z.string().nullable().optional(),
});

export const generationRowSchema = z.object({
  id: z.string(),
  content_id: z.string(),
  user_id: z.string(),
  model: z.string(),
  generation_version: z.string(),
  processing_time_ms: z.number().nullable().optional(),
  summary: z.string(),
  key_concepts: z.array(z.string()).default([]),
  tasks: z.array(z.unknown()).default([]),
  quiz_items: z.array(z.unknown()).default([]),
  session_plan: z.unknown(),
  user_rating: z.number().nullable().optional(),
  was_helpful: z.boolean().nullable().optional(),
  times_used: z.number().default(0),
  last_used_at: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export function mapContentRow(row: unknown) {
  const parsed = contentRowSchema.parse(row);
  return StudyContentSchema.parse({
    id: parsed.id,
    userId: parsed.user_id,
    sourceType: parsed.source_type,
    sourceUrl: parsed.source_url ?? undefined,
    originalFilename: parsed.original_filename ?? undefined,
    storagePath: parsed.storage_path ?? undefined,
    title: parsed.title ?? undefined,
    extractedText: parsed.extracted_text,
    extractedLength: parsed.extracted_length,
    language: parsed.language,
    userEditedText: parsed.user_edited_text ?? undefined,
    isUserEdited: parsed.is_user_edited,
    status: parsed.status,
    errorMessage: parsed.error_message ?? undefined,
    generationCount: parsed.generation_count_today,
    lastGenerationDate: parsed.last_generation_date ?? undefined,
    deletedAt: parsed.deleted_at ?? undefined,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
    extractedAt: parsed.extracted_at ?? undefined,
  });
}

export function mapGenerationRow(row: unknown) {
  const parsed = generationRowSchema.parse(row);
  return StudyGenerationSchema.parse({
    id: parsed.id,
    contentId: parsed.content_id,
    userId: parsed.user_id,
    model: parsed.model,
    generationVersion: parsed.generation_version,
    processingTimeMs: parsed.processing_time_ms ?? undefined,
    summary: typeof parsed.summary === "string"
      ? JSON.parse(parsed.summary) as Record<string, unknown>
      : parsed.summary,
    keyConcepts: parsed.key_concepts,
    tasks: parsed.tasks,
    quizItems: parsed.quiz_items,
    sessionPlan: parsed.session_plan,
    userRating: parsed.user_rating ?? undefined,
    wasHelpful: parsed.was_helpful ?? undefined,
    timesUsed: parsed.times_used,
    lastUsedAt: parsed.last_used_at ?? undefined,
    deletedAt: parsed.deleted_at ?? undefined,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  });
}
