/**
 * Economy Offline Queue - Schemas and Types
 */

import { z } from 'zod';

export const QueueEntryStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CONFLICT',
]);

export const QueueEntryTypeSchema = z.enum([
  'EARN_CURRENCY',
  'SPEND_CURRENCY',
  'CONVERT_CURRENCY',
  'PURCHASE_ITEM',
  'REFUND_PURCHASE',
]);

export const QueueEntrySchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: QueueEntryTypeSchema,

    // Operation data
    payload: z.record(z.unknown()),

    // Queue metadata
    status: QueueEntryStatusSchema,
    priority: z.number().int().min(1).max(10).default(5),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),

    // Retry metadata
    retryCount: z.number().int().min(0).default(0),
    maxRetries: z.number().int().min(1).default(3),
    nextRetryAt: z.number().int().nullable(),
    lastError: z.string().max(500).nullable(),

    // Deduplication key
    dedupeKey: z.string().nullable(),

    // Dependencies (other entries that must complete first)
    dependencies: z.array(z.string().uuid()).default([]),
  })
  .strict();

export type QueueEntryStatus = z.infer<typeof QueueEntryStatusSchema>;
export type QueueEntryType = z.infer<typeof QueueEntryTypeSchema>;
export type QueueEntry = z.infer<typeof QueueEntrySchema>;

export function readStringPayload(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === 'string' ? value : null;
}

export function readNumberPayload(
  payload: Record<string, unknown>,
  key: string,
): number | null {
  const value = payload[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
