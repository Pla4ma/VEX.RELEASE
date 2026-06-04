import { getSupabaseClient } from '../../config/supabase';
import * as FileSystem from 'expo-file-system';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';
import type {
  ExtractContentRequest,
  GenerateStudyPlanRequest,
  SubmitContentRequest,
  SubmitFeedbackRequest,
} from './types';
import { createDebugger } from '../../utils/debug';
import { withResilience } from '../../utils/supabase-resilience';
import { mapContentRow, mapGenerationRow } from './row-mappers';
import { sanitizeFilename } from './validators-file';
const debug = createDebugger('content-study:repository');
const ALLOWED_URI_SCHEMES = ['file://', 'content://', 'https://'] as const;

/**
 * Validates that a file URI uses an allowed scheme.
 * Throws a descriptive error if the URI scheme is not permitted.
 * SEC-002: Prevent arbitrary URI schemes from being fetched.
 */
export function validateFileUri(fileUri: string): void {
  const hasAllowedScheme = ALLOWED_URI_SCHEMES.some((scheme) =>
    fileUri.startsWith(scheme),
  );
  if (!hasAllowedScheme) {
    throw new Error(
      `Invalid file URI scheme. URI must start with one of: ${ALLOWED_URI_SCHEMES.join(', ')}. Received: ${fileUri.split(':')[0]}://`,
    );
  }
}

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

export async function uploadStudyFileRecord(
  fileUri: string,
  filename: string,
  userId: string,
): Promise<string> {
  try {
    debug.info('Uploading study file: %s for user: %s', filename, userId);

    // P2-15: Check connectivity before upload attempt
    const netState = getNetInfoAdapter().getCurrentState();
    if (!netState.isConnected) {
      throw new Error('Upload requires an internet connection. Please connect and try again.');
    }

    validateFileUri(fileUri);
    const scheme = fileUri.split(':', 1)[0]!.toLowerCase();
    if (scheme !== 'file' && scheme !== 'content' && scheme !== 'https') {
      throw new Error(`Unsupported file URI scheme: ${scheme}`);
    }
    // P0-6: Use expo-file-system for reliable cross-platform file reading
    // globalThis.fetch() for file:// URIs is platform-specific and unreliable
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error(`File not found at URI: ${fileUri}`);
    }
    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const safeFilename = sanitizeFilename(filename);
    const ext = safeFilename.split('.').pop()?.toLowerCase() ?? '';
    const contentType = ext === 'pdf'
      ? 'application/pdf'
      : ext === 'txt'
        ? 'text/plain'
        : ext === 'md'
          ? 'text/markdown'
          : 'application/octet-stream';
    // Decode base64 to binary for upload
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: contentType });
    const filePath = `${userId}/${Date.now()}_${safeFilename}`;
    const { error } = await getSupabaseClient()
      .storage.from('study-content')
      .upload(filePath, blob, {
        contentType,
        upsert: false,
      });
    if (error) {
      debug.error('Supabase storage upload failed', error);
      throw new Error('Storage upload failed');
    }
    debug.info('Study file uploaded successfully: %s', filePath);
    return filePath;
  } catch (error) {
    debug.error('uploadStudyFileRecord failed', error as Error);
    throw error;
  }
}

export async function deleteStudyFileRecord(filePath: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .storage.from('study-content')
    .remove([filePath]);
  if (error) {
    throw new Error('Failed to delete file');
  }
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
    .select('id,content_id,user_id,model,generation_version,processing_time_ms,summary,key_concepts,tasks,quiz_items,session_plan,user_rating,was_helpful,times_used,last_used_at,deleted_at,created_at,updated_at')
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
