import { getSupabaseClient } from '../../../config/supabase';
import {
  BehaviorSignalSchema,
  BehaviorProfileSchema,
  type BehaviorSignal,
  type BehaviorProfile,
} from '../schemas';
import { RepositoryError } from './error';

const supabase = getSupabaseClient();

export async function fetchBehaviorProfile(
  userId: string,
): Promise<BehaviorProfile | null> {
  const { data, error } = await supabase
    .from('behavior_profiles')
    .select('id,user_id,confidence_level,cold_start,data_points,signals,last_updated,created_at,updated_at,metadata')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchBehaviorProfile', error);
  }
  return data ? BehaviorProfileSchema.parse(data) : null;
}

export async function upsertBehaviorProfile(
  profile: BehaviorProfile,
): Promise<BehaviorProfile> {
  const { data, error } = await supabase
    .from('behavior_profiles')
    .upsert({
      user_id: profile.userId,
      signals: profile.signals,
      last_updated: profile.lastUpdated,
      confidence_level: profile.confidenceLevel,
      cold_start: profile.coldStart,
      data_points: profile.dataPoints,
    })
    .select()
    .single();
  if (error) {
    throw new RepositoryError('upsertBehaviorProfile', error);
  }
  return BehaviorProfileSchema.parse(data);
}

export async function addBehaviorSignal(
  signal: BehaviorSignal,
): Promise<BehaviorSignal> {
  const { data, error } = await supabase
    .from('behavior_signals')
    .insert({
      id: signal.id,
      user_id: signal.userId,
      signal_type: signal.signalType,
      value: signal.value,
      confidence: signal.confidence,
      timestamp: signal.timestamp,
      metadata: signal.metadata,
      expires_at: signal.expiresAt,
    })
    .select()
    .single();
  if (error) {
    throw new RepositoryError('addBehaviorSignal', error);
  }
  return BehaviorSignalSchema.parse(data);
}

export async function fetchRecentBehaviorSignals(
  userId: string,
  limit: number = 50,
): Promise<BehaviorSignal[]> {
  const { data, error } = await supabase
    .from('behavior_signals')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError('fetchRecentBehaviorSignals', error);
  }
  return BehaviorSignalSchema.array().parse(data || []);
}
