import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import {
  StudyContentSchema,
  StudyGenerationSchema,
  type ExtractContentRequest,
  type GenerateStudyPlanRequest,
  type SubmitContentRequest,
  type SubmitFeedbackRequest,
} from "./types";
import { createDebugger } from "../../utils/debug";
import { withResilience } from "../../utils/supabase-resilience";
const debug = createDebugger("content-study:repository");
const contentRowSchema = z.object({
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
const generationRowSchema = z.object({
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
function mapContentRow(row: unknown) {
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
    generationCountToday: parsed.generation_count_today,
    lastGenerationDate: parsed.last_generation_date ?? undefined,
    deletedAt: parsed.deleted_at ?? undefined,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
    extractedAt: parsed.extracted_at ?? undefined,
  });
}
function mapGenerationRow(row: unknown) {
  const parsed = generationRowSchema.parse(row);
  return StudyGenerationSchema.parse({
    id: parsed.id,
    contentId: parsed.content_id,
    userId: parsed.user_id,
    model: parsed.model,
    generationVersion: parsed.generation_version,
    processingTimeMs: parsed.processing_time_ms ?? undefined,
    summary: parsed.summary,
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
export async function invokeContentStudy(
  path: string,
  body?: unknown,
  method?: "GET" | "POST",
) {
  return withResilience(
    getSupabaseClient().functions.invoke(path, {
      body: body as
        | Record<string, unknown>
        | string
        | Blob
        | FormData
        | ArrayBuffer
        | undefined,
      ...(method ? { method } : {}),
    }),
    { operation: `invokeContentStudy:${path}` },
  );
}
export async function uploadStudyFileRecord(
  fileUri: string,
  filename: string,
  userId: string,
): Promise<string> {
  try {
    debug.info("Uploading study file: %s for user: %s", filename, userId);
    const response = await globalThis["fetch"](fileUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URI: ${response.statusText}`);
    }
    const blob = await response.blob();
    const filePath = `${userId}/${Date.now()}_${filename}`;
    const { error } = await getSupabaseClient()
      .storage.from("study-content")
      .upload(filePath, blob, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (error) {
      debug.error("Supabase storage upload failed", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
    debug.info("Study file uploaded successfully: %s", filePath);
    return filePath;
  } catch (error) {
    debug.error("uploadStudyFileRecord failed", error as Error);
    throw error;
  }
}
export async function deleteStudyFileRecord(filePath: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .storage.from("study-content")
    .remove([filePath]);
  if (error) {
    throw new Error(error.message);
  }
}
export async function fetchContentHistoryRecords(userId: string, limit = 20) {
  const { data, error } = await withResilience(
    getSupabaseClient()
      .from("study_content")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit),
    { operation: "fetchContentHistoryRecords", fallbackValue: [] },
  );
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapContentRow);
}
export async function fetchContentRecord(contentId: string) {
  const { data, error } = await getSupabaseClient()
    .from("study_content")
    .select("*")
    .eq("id", contentId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapContentRow(data) : null;
}
export async function fetchGenerationRecord(generationId: string) {
  const { data, error } = await getSupabaseClient()
    .from("study_generations")
    .select("*")
    .eq("id", generationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapGenerationRow(data) : null;
}
export async function updateContentTextRecord(
  contentId: string,
  editedText: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("study_content")
    .update({
      user_edited_text: editedText,
      is_user_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contentId);
  if (error) {
    throw new Error(error.message);
  }
}
export async function deleteContentRecord(contentId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("study_content")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contentId);
  if (error) {
    throw new Error(error.message);
  }
}
export type {
  ExtractContentRequest,
  GenerateStudyPlanRequest,
  SubmitContentRequest,
  SubmitFeedbackRequest,
};
