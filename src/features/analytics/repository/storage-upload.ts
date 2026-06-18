import { captureSilentFailure } from '../../../utils/silent-failure';
import { withRetry, withTimeout } from '../../../shared/hardening/retry';
import * as Sentry from '@sentry/react-native';
import type { UploadResult } from './storage-types';
import { AnalyticsStorageError } from './storage-types';
import {
  supabase,
  storageCircuitBreaker,
  calculateChecksum,
  convertToCSV,
  isRetryableStorageError,
  EXPORT_SIGNED_URL_TTL_SECONDS,
} from './storage-helpers';

export async function uploadExportData(
  jobId: string,
  data: unknown,
  format: 'json' | 'csv',
  userId: string,
): Promise<UploadResult> {
  return storageCircuitBreaker.execute(async () => {
    const bucket = 'analytics-exports';
    const path = `${userId}/${jobId}.${format}`;
    const content =
      format === 'json' ? JSON.stringify(data, null, 2) : convertToCSV(data);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const fileSize = blob.size;
    const checksum = await calculateChecksum(content);
    if (fileSize > 5 * 1024 * 1024) {
      return await uploadLargeFile(bucket, path, blob, checksum, jobId);
    }
    return await withRetry(
      async () => {
        const { data: _uploadData, error } = await withTimeout(() => supabase.storage
            .from(bucket)
            .upload(path, blob, {
              contentType: format === 'json' ? 'application/json' : 'text/csv',
              upsert: false,
              metadata: {
                jobId,
                userId,
                checksum,
                format,
                uploadedAt: Date.now().toString(),
              },
            }),
          60000,
          'Storage upload timeout',
        );
        if (error) {
          throw new AnalyticsStorageError(
            `Upload failed: ${error.message}`,
            error.name,
            bucket,
            path,
            isRetryableStorageError(error),
          );
        }
        const { data: urlData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, EXPORT_SIGNED_URL_TTL_SECONDS);
        return {
          url: urlData?.signedUrl || '',
          size: fileSize,
          checksum,
          uploadedAt: Date.now(),
          expiresAt: Date.now() + EXPORT_SIGNED_URL_TTL_SECONDS * 1000,
        };
      },
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        retryableErrors: ['network_error', 'timeout', 'rate_limited'],
        onRetry: (attempt: number, error: Error) => {
          Sentry.addBreadcrumb({
            category: 'storage',
            message: `Retrying upload attempt ${attempt}`,
            level: 'warning',
            data: { jobId, error: error.message },
          });
        },
      },
    );
  });
}

async function uploadLargeFile(
  bucket: string,
  path: string,
  blob: Blob,
  checksum: string,
  jobId: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const chunkSize = 5 * 1024 * 1024;
  const totalChunks = Math.ceil(blob.size / chunkSize);
  const maxAttempts = 5;
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      onProgress?.((attempt - 1) * 20);
      const { data: _data, error } = await withTimeout(() => supabase.storage
          .from(bucket)
          .upload(path, blob, {
            contentType: blob.type,
            upsert: true,
            metadata: {
              jobId,
              checksum,
              chunks: totalChunks.toString(),
              uploadedAt: Date.now().toString(),
            },
            duplex: 'half',
          } as { [key: string]: unknown }),
        300000,
        `Large file upload timeout (attempt ${attempt})`,
      );
      if (error) {
        lastError = new AnalyticsStorageError(
          `Upload failed: ${error.message}`,
          error.name,
          bucket,
          path,
          isRetryableStorageError(error),
        );
        if (!isRetryableStorageError(error) || attempt === maxAttempts) {
          throw lastError;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt)),
        );
        continue;
      }
      onProgress?.(100);
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour TTL
      return {
        url: urlData?.signedUrl || '',
        size: blob.size,
        checksum,
        uploadedAt: Date.now(),
        expiresAt: Date.now() + 3600 * 1000,
      };
    } catch (error) {
      if (attempt === maxAttempts) {
        try {
          await supabase.storage.from(bucket).remove([path]);
        } catch (cleanupError) {
          captureSilentFailure(cleanupError, {
            feature: 'analytics',
            operation: 'safe-fallback',
            type: 'data',
          });
        }
        throw error;
      }
    }
  }
  throw lastError || new Error('Upload failed after all retries');
}
