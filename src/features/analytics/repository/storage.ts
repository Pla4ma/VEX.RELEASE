import { withRetry, withTimeout } from "../../../shared/hardening";
import type { DownloadResult } from "./storage-types";
import { AnalyticsStorageError } from "./storage-types";
import {
  supabase,
  storageCircuitBreaker,
  calculateChecksum,
  isRetryableStorageError,
} from "./storage-helpers";

export type { StorageUploadConfig, UploadResult, DownloadResult, StorageError } from "./storage-types";
export { AnalyticsStorageError } from "./storage-types";
export { uploadExportData } from "./storage-upload";

export async function downloadExportData(
  jobId: string,
  userId: string,
  format: "json" | "csv",
): Promise<DownloadResult> {
  return storageCircuitBreaker.execute(async () => {
    const bucket = "analytics-exports";
    const path = `${userId}/${jobId}.${format}`;
    return await withRetry(
      async () => {
        const { data, error } = await withTimeout(
          supabase.storage.from(bucket).download(path),
          30000,
          "Storage download timeout",
        );
        if (error) {
          throw new AnalyticsStorageError(
            `Download failed: ${error.message}`,
            error.name,
            bucket,
            path,
            isRetryableStorageError(error),
          );
        }
        if (!data) {
          throw new AnalyticsStorageError(
            "No data returned from download",
            "EMPTY_RESPONSE",
            bucket,
            path,
            false,
          );
        }
        const content = await data.text();
        const checksum = await calculateChecksum(content);
        const { data: metadata } = await supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        return {
          data,
          url: metadata?.publicUrl || "",
          contentType: format === "json" ? "application/json" : "text/csv",
          size: data.size,
          checksum,
        };
      },
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        retryableErrors: ["network_error", "timeout"],
      },
    );
  });
}

export async function deleteExportData(
  jobId: string,
  userId: string,
  format: "json" | "csv",
): Promise<void> {
  const bucket = "analytics-exports";
  const path = `${userId}/${jobId}.${format}`;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new AnalyticsStorageError(
      `Delete failed: ${error.message}`,
      error.name,
      bucket,
      path,
      false,
    );
  }
}

export async function getStorageMetrics(
  userId: string,
): Promise<{
  totalExports: number;
  totalSize: number;
  oldestExport: number | null;
}> {
  const bucket = "analytics-exports";
  const prefix = `${userId}/`;
  const { data, error } = await supabase.storage.from(bucket).list(prefix);
  if (error || !data) {
    return { totalExports: 0, totalSize: 0, oldestExport: null };
  }
  const totalSize = data.reduce(
    (sum, item) => sum + ((item.metadata as Record<string, number> | undefined)?.size || 0),
    0,
  );
  const timestamps = data
    .map((item) =>
      item.created_at ? new Date(item.created_at).getTime() : null,
    )
    .filter((t): t is number => t !== null);
  return {
    totalExports: data.length,
    totalSize,
    oldestExport: timestamps.length > 0 ? Math.min(...timestamps) : null,
  };
}

export async function cleanupOldExports(
  userId: string,
  maxAgeDays: number = 30,
): Promise<{ deleted: number; freedSpace: number }> {
  const bucket = "analytics-exports";
  const prefix = `${userId}/`;
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const { data, error } = await supabase.storage.from(bucket).list(prefix);
  if (error || !data) {
    return { deleted: 0, freedSpace: 0 };
  }
  const toDelete = data.filter((item) => {
    const created = item.created_at
      ? new Date(item.created_at).getTime()
      : null;
    return created && created < cutoff;
  });
  if (toDelete.length === 0) {
    return { deleted: 0, freedSpace: 0 };
  }
  const paths = toDelete.map((item) => `${prefix}${item.name}`);
  const freedSpace = toDelete.reduce(
    (sum, item) => sum + ((item.metadata as Record<string, number> | undefined)?.size || 0),
    0,
  );
  const { error: deleteError } = await supabase.storage
    .from(bucket)
    .remove(paths);
  if (deleteError) {
    throw new AnalyticsStorageError(
      `Cleanup failed: ${deleteError.message}`,
      deleteError.name,
      bucket,
      prefix,
      true,
    );
  }
  return { deleted: toDelete.length, freedSpace };
}
