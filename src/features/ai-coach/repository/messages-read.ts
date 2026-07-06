import { getSupabaseClient } from '../../../config/supabase';
import { CoachMessageSchema, type CoachMessage } from '../schemas';
import { RepositoryError } from './error';

const supabase = getSupabaseClient();

export async function markMessageRead(
  messageId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('coach_messages')
    .update({ status: 'READ', read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('user_id', userId);

  if (error) {
    throw new RepositoryError('markMessageRead', error);
  }
}

export async function dismissMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('coach_messages')
    .update({ status: 'DISMISSED', dismissed_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('user_id', userId);

  if (error) {
    throw new RepositoryError('dismissMessage', error);
  }
}

export async function fetchCoachHistory(
  userId: string,
  limit: number = 100,
): Promise<{ messages: CoachMessage[]; mutedCategories: string[] }> {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('id,user_id,persona_id,category,content,delivery_method,priority,status,created_at,scheduled_for,delivered_at,read_at,dismissed_at,action_taken,action_taken_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError('fetchCoachHistory', error);
  }

  const messages = CoachMessageSchema.array().parse(data || []);

  const mutedCategories: string[] = [];
  const mutedCategoriesSet = new Set<string>();
  for (const m of messages) {
    if (m.status === 'DISMISSED' && !mutedCategoriesSet.has(m.category)) {
      mutedCategories.push(m.category);
      mutedCategoriesSet.add(m.category);
    }
  }

  return { messages, mutedCategories };
}
