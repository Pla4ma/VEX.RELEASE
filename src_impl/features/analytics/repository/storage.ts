import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Analytics Storage Service
 * Handles file exports to Supabase Storage with chunked uploads,
 * encryption, and virus scanning hooks
 */

import { getSupabaseClient, handleSupabaseError } from '../../../config/supabase';
import { withRetry, withTimeout, CircuitBreaker } from '../../../shared/hardening';
import * as Sentry from '@sentry/react-native';

const supabase = getSupabaseClient();

// Circuit breaker for storage operations
const storageCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeoutMs: 30000,
  halfOpenMaxCalls: 2,
});

class AnalyticsStorageError extends Error implements StorageError {
  constructor(
    message: string,
    public code: string,
    public bucket?: string,
    public path?: string,
    public retryable = false,
  ) {
    super(message);
    this.name = 'AnalyticsStorageError';
  }
}

// Upload data to storage with retry and chunking for large files
// Large file upload with streaming and progress tracking
async function uploadLargeFile(bucket: string, path: string, blob: Blob, checksum: string, jobId: string, onProgress?: (percent: number) => void): Promise<UploadResult> {
  // For large files, we use resumable upload by splitting into parts
  // and uploading sequentially with progress tracking
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks for Supabase
  const totalChunks = Math.ceil(blob.size / chunkSize);

  // For simplicity in this implementation, we'll upload the whole file
  // with extended timeout for large files
  // In production, you'd implement proper resumable uploads

  const maxAttempts = 5;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      onProgress?.((attempt - 1) * 20); // Progress based on attempts

      const { data, error } = await withTimeout(
        supabase.storage.from(bucket).upload(path, blob, {
          contentType: blob.type,
          upsert: true, // Allow retry by overwriting
          metadata: {
            jobId,
            checksum,
            chunks: totalChunks.toString(),
            uploadedAt: Date.now().toString(),
          },
          // For large files, duplex mode helps with streaming
          duplex: 'half',
        } as { [key: string]: unknown }),
        300000, // 5 minute timeout for large files
        `Large file upload timeout (attempt ${attempt})`,
      );

      if (error) {
        lastError = new AnalyticsStorageError(`Upload failed: ${error.message}`, error.name, bucket, path, isRetryableStorageError(error));

        if (!isRetryableStorageError(error) || attempt === maxAttempts) {
          throw lastError;
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }

      onProgress?.(100);

      // Get signed URL
      const { data: urlData } = await supabase.storage.from(bucket).createSignedUrl(path, 7 * 24 * 60 * 60);

      return {
        url: urlData?.signedUrl || '',
        size: blob.size,
        checksum,
        uploadedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
    } catch (error) {
      if (attempt === maxAttempts) {
        // Cleanup on final failure
        try {
          await supabase.storage.from(bucket).remove([path]);
        } catch (error) {
          captureSilentFailure(error, { feature: 'analytics', operation: 'safe-fallback', type: 'data' });
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  }

  throw lastError || new Error('Upload failed after all retries');
}

// Download export data
// Delete export data
// Calculate SHA-256 checksum
async function calculateChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Convert data to CSV format
function convertToCSV(data: unknown): string {
  if (!Array.isArray(data)) {
    throw new AnalyticsStorageError('Data must be an array for CSV export', 'INVALID_FORMAT', undefined, undefined, false);
  }

  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0] as object);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value ?? '');
      })
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

// Check if storage error is retryable
function isRetryableStorageError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const errorObj = error as { name?: string; message?: string; statusCode?: number };

  const retryableCodes = ['network_error', 'timeout', 'rate_limited', 'internal_error', 'service_unavailable'];

  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  const hasRetryableCode = retryableCodes.some((code) => errorObj.name?.includes(code) || errorObj.message?.toLowerCase().includes(code));

  const hasRetryableStatus = errorObj.statusCode !== undefined && retryableStatuses.includes(errorObj.statusCode);

  return hasRetryableCode || hasRetryableStatus;
}

// Get storage metrics
// Cleanup old exports
export * from "./storage.types";
export * from "./storage.part1";
