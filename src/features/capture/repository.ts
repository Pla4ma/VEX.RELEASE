import { getSupabaseClient } from '../../config/supabase';
import type { CaptureItem } from './types';

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
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: data as CaptureItem,
    error: null,
  };
}

export async function fetchCaptures(
  userId: string,
  limit: number = 50,
): Promise<{ data: CaptureItem[] | null; error: Error | null }> {
  const { data, error } = await getSupabaseClient()
    .from('captures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: (data as CaptureItem[]) ?? [],
    error: null,
  };
}
