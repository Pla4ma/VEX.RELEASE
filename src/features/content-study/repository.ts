import { getSupabaseClient } from '../../config/supabase';
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
    validateFileUri(fileUri);
    const scheme = fileUri.split(':', 1)[0]!.toLowerCase();
    if (scheme !== 'file' && scheme !== 'content' && scheme !== 'https') {
      throw new Error(`Unsupported file URI scheme: ${scheme}`);
    }
    const response = await globalThis.fetch(fileUri);
    if (!response.ok) {
      throw new Error('Failed to read file for upload');
    }
    const safeFilename = sanitizeFilename(filename);
    const ext = safeFilename.split('.').pop()?.toLowerCase() ?? '';
    const contentType = ext === 'pdf'
      ? 'application/pdf'
      : ext === 'txt'
        ? 'text/plain'
        : ext === 'md'
          ? 'text/markdown'
          : 'application/octet-stream';
    const blob = await response.blob();
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
      .select('*')
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
    .select('*')
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
    .select('*')
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
