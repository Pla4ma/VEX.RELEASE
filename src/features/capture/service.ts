import { createCapture, fetchCaptures } from './repository';
import type { CaptureItem, CaptureType } from './types';

export async function submitCapture(
  userId: string,
  type: CaptureType,
  content: string,
  metadata?: Record<string, string>,
): Promise<{ item: CaptureItem | null; error: Error | null }> {
  if (!content.trim()) {
    return { item: null, error: new Error('Capture content cannot be empty') };
  }

  const result = await createCapture(userId, type, content, metadata);
  return { item: result.data, error: result.error };
}

export async function loadCaptures(
  userId: string,
  limit?: number,
): Promise<{ items: CaptureItem[]; error: Error | null }> {
  const result = await fetchCaptures(userId, limit);
  return { items: result.data ?? [], error: result.error };
}
