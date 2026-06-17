import { getSupabaseClient } from '../../config/supabase';
import type {
  ExtractContentRequest,
  GenerateStudyPlanRequest,
  SubmitContentRequest,
  SubmitFeedbackRequest,
} from './types';
import { withResilience } from '../../utils/supabase-resilience';
import { mapContentRow, mapGenerationRow } from './row-mappers';

export {
  validateFileUri,
  uploadStudyFileRecord,
  deleteStudyFileRecord,
} from './repository-uploads';

export async function invokeContentStudy(
  path: string,
  body?: unknown,
  method?: 'GET' | 'POST',
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

export async function fetchContentHistoryRecords(userId: string, limit = 20) {
  const { data, error } = await withResilience(
    getSupabaseClient()
      .from('study_content')
      .select('id,user_id,source_type,source_url,original_filename,storage_path,title,extracted_text,extracted_length,language,user_edited_text,is_user_edited,status,error_message,generation_count_today,last_generation_date,deleted_at,created_at,updated_at,extracted_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit),
    { operation: 'fetchContentHistoryRecords', fallbackValue: [] },
  );
  if (error) {
    throw new Error('Failed to fetch content history');
  }
  return (data ?? []).map(mapContentRow);
}

export async function fetchContentRecord(contentId: string) {
  const { data, error } = await getSupabaseClient()
    .from('study_content')
    .select('id,user_id,source_type,source_url,original_filename,storage_path,title,extracted_text,extracted_length,language,user_edited_text,is_user_edited,status,error_message,generation_count_today,last_generation_date,deleted_at,created_at,updated_at,extracted_at')
    .eq('id', contentId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    throw new Error('Failed to fetch content record');
  }
  return data ? mapContentRow(data) : null;
}

export async function fetchGenerationRecord(generationId: string) {
  const { data, error } = await getSupabaseClient()
    .from('study_generations')
    .select('id,content_id,user_id,model,generation_version,processing_time_ms,summary,key_concepts,tasks,quiz_items,session_plan,user_rating,was_helpful,times_used,last_used_at,is_llm_generated,deleted_at,created_at,updated_at')
    .eq('id', generationId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    throw new Error('Failed to fetch generation record');
  }
  return data ? mapGenerationRow(data) : null;
}

export async function updateContentTextRecord(
  contentId: string,
  editedText: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('study_content')
    .update({
      user_edited_text: editedText,
      is_user_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);
  if (error) {
    throw new Error('Failed to update content text');
  }
}

export async function deleteContentRecord(contentId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('study_content')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contentId);
  if (error) {
    throw new Error('Failed to delete content record');
  }
}

export type {
  ExtractContentRequest,
  GenerateStudyPlanRequest,
  SubmitContentRequest,
  SubmitFeedbackRequest,
};
