import { getSupabaseClient } from '../../config/supabase';
import * as FileSystem from 'expo-file-system';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';
import { sanitizeFilename } from './validators-file';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('content-study:repository-uploads');

/**
 * Allowed URI schemes for file uploads.
 * SEC-002: Prevent arbitrary URI schemes from being fetched.
 */
const ALLOWED_URI_SCHEMES = ['file://', 'content://'] as const;

/**
 * Validates that a file URI uses an allowed scheme.
 * Throws a descriptive error if the URI scheme is not permitted.
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

export async function uploadStudyFileRecord(
  fileUri: string,
  filename: string,
  userId: string,
): Promise<string> {
  try {
    debug.info('Uploading study file: %s for user: %s', filename, userId);

    const netState = getNetInfoAdapter().getCurrentState();
    if (!netState.isConnected) {
      throw new Error('Upload requires an internet connection. Please connect and try again.');
    }

    validateFileUri(fileUri);
    const scheme = fileUri.split(':', 1)[0]!.toLowerCase();
    if (scheme !== 'file' && scheme !== 'content') {
      throw new Error(`Unsupported file URI scheme: ${scheme}`);
    }

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
