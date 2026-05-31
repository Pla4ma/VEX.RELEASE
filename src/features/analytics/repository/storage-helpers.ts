import {
  CircuitBreaker,
} from '../../../shared/hardening';
import { AnalyticsStorageError } from './storage-types';

/** Re-export singleton from canonical source to avoid stale module-level references */
export { supabase } from '../../../config/supabase';

export const storageCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeoutMs: 30000,
  halfOpenMaxCalls: 2,
});

export async function calculateChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function convertToCSV(data: unknown): string {
  if (!Array.isArray(data)) {
    throw new AnalyticsStorageError(
      'Data must be an array for CSV export',
      'INVALID_FORMAT',
      undefined,
      undefined,
      false,
    );
  }
  if (data.length === 0) {
    return '';
  }
  const headers = Object.keys(data[0] as object);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value ?? '');
      })
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function isRetryableStorageError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const errorObj = error as {
    name?: string;
    message?: string;
    statusCode?: number;
  };
  const retryableCodes = [
    'network_error',
    'timeout',
    'rate_limited',
    'internal_error',
    'service_unavailable',
  ];
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const hasRetryableCode = retryableCodes.some(
    (code) =>
      errorObj.name?.includes(code) ||
      errorObj.message?.toLowerCase().includes(code),
  );
  const hasRetryableStatus =
    errorObj.statusCode !== undefined &&
    retryableStatuses.includes(errorObj.statusCode);
  return hasRetryableCode || hasRetryableStatus;
}
