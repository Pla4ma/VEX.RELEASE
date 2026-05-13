import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { StudyContentSchema, StudyGenerationSchema, type ExtractContentRequest, type GenerateStudyPlanRequest, type SubmitContentRequest, type SubmitFeedbackRequest } from "./types";
import { createDebugger } from "../../utils/debug";
import { withResilience } from "../../utils/supabase-resilience";


export async function invokeContentStudy(path: string, body?: unknown, method?: 'GET' | 'POST') {
  return withResilience(
    getSupabaseClient().functions.invoke(path, {
      body: body as Record<string, unknown> | string | Blob | FormData | ArrayBuffer | undefined,
      ...(method ? { method } : {}),
    }),
    { operation: `invokeContentStudy:${path}` }
  );
}

export async function uploadStudyFileRecord(fileUri: string, filename: string, userId: string): Promise<string> {
  try {
    debug.info('Uploading study file: %s for user: %s', filename, userId);

    // Ensure fileUri is properly formatted for fetch
    const response = await globalThis['fetch'](fileUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URI: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filePath = `${userId}/${Date.now()}_${filename}`;

    const { error } = await getSupabaseClient().storage.from('study-content').upload(filePath, blob, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (error) {
      debug.error('Supabase storage upload failed', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    debug.info('Study file uploaded successfully: %s', filePath);
    return filePath;
  } catch (error) {
    debug.error('uploadStudyFileRecord failed', error as Error);
    throw error;
  }
}

export async function deleteStudyFileRecord(filePath: string): Promise<void> {
  const { error } = await getSupabaseClient().storage.from('study-content').remove([filePath]);
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchContentHistoryRecords(userId: string, limit = 20) {
  const { data, error } = await withResilience(
    getSupabaseClient()
      .from('study_content')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit),
    { operation: 'fetchContentHistoryRecords', fallbackValue: [] }
  );
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapContentRow);
}

export async function fetchContentRecord(contentId: string) {
  const { data, error } = await getSupabaseClient()
    .from('study_content')
    .select('*')
    .eq('id', contentId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapContentRow(data) : null;
}

export async function fetchGenerationRecord(generationId: string) {
  const { data, error } = await getSupabaseClient()
    .from('study_generations')
    .select('*')
    .eq('id', generationId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapGenerationRow(data) : null;
}

export async function updateContentTextRecord(contentId: string, editedText: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('study_content')
    .update({ user_edited_text: editedText, is_user_edited: true, updated_at: new Date().toISOString() })
    .eq('id', contentId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteContentRecord(contentId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('study_content')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contentId);
  if (error) {
    throw new Error(error.message);
  }
}