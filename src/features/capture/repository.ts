import { getSupabaseClient } from '../../config/supabase';
import { tableColumns } from '../../lib/repository/tableColumns';
import { CaptureItemSchema } from './schemas';
import type { CaptureItem } from './types';

function mapCaptureItem(input: unknown): CaptureItem {
  const row = CaptureItemSchema.pick({
    id: true,
    type: true,
    content: true,
    metadata: true,
  }).extend({
    created_at: CaptureItemSchema.shape.createdAt,
    user_id: CaptureItemSchema.shape.userId,
  }).parse(input);

  return CaptureItemSchema.parse({
    id: row.id,
    type: row.type,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.created_at,
    userId: row.user_id,
  });
}

export async function createCapture(
  userId: string,
  type: string,
  content: string,
  metadata?: Record<string, string>,
): Promise<{ data: CaptureItem | null; error: Error | null }> {
  const { data, error } = await getSupabaseClient()
    .from('captures')
    .insert({
      user_id: userId,
      type,
      content,
      metadata,
    })
    .select(tableColumns('captures'))
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: mapCaptureItem(data),
    error: null,
  };
}

export async function fetchCaptures(
  userId: string,
  limit: number = 50,
): Promise<{ data: CaptureItem[] | null; error: Error | null }> {
  const { data, error } = await getSupabaseClient()
    .from('captures')
    .select(tableColumns('captures'))
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: (data ?? []).map(mapCaptureItem),
    error: null,
  };
}
