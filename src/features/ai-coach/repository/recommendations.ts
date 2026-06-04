import { getSupabaseClient } from '../../../config/supabase';
import {
  SessionRecommendationSchema,
  type SessionRecommendation,
  type RecommendationType,
} from '../schemas';
import { RepositoryError } from './error';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

export async function fetchRecommendations(
  userId: string,
  limit: number = 10,
): Promise<SessionRecommendation[]> {
  const { data, error } = await supabase
    .from('session_recommendations')
    .select('id,user_id,recommendation_type,title,description,priority,reason,metadata,status,created_at,expires_at,accepted_at,dismissed_at,suggested_duration,suggested_difficulty,reasoning,confidence,based_on')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError('fetchRecommendations', error);
  }
  return SessionRecommendationSchema.array().parse(data || []);
}

export async function fetchActiveRecommendations(
  userId: string,
  limit: number = 10,
): Promise<SessionRecommendation[]> {
  const { data, error } = await supabase
    .from('session_recommendations')
    .select('id,user_id,recommendation_type,title,description,priority,reason,metadata,status,created_at,expires_at,accepted_at,dismissed_at,suggested_duration,suggested_difficulty,reasoning,confidence,based_on')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError('fetchActiveRecommendations', error);
  }
  return SessionRecommendationSchema.array().parse(data || []);
}

export async function fetchRecommendationsByType(
  userId: string,
  type: RecommendationType,
): Promise<SessionRecommendation[]> {
  const { data, error } = await supabase
    .from('session_recommendations')
    .select('id,user_id,recommendation_type,title,description,priority,reason,metadata,status,created_at,expires_at,accepted_at,dismissed_at,suggested_duration,suggested_difficulty,reasoning,confidence,based_on')
    .eq('user_id', userId)
    .eq('recommendation_type', type)
    .order('created_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchRecommendationsByType', error);
  }
  return SessionRecommendationSchema.array().parse(data || []);
}

export async function createRecommendation(
  recommendation: SessionRecommendation,
): Promise<SessionRecommendation> {
  const { data, error } = await supabase
    .from('session_recommendations')
    .insert({
      id: recommendation.id,
      user_id: recommendation.userId,
      recommendation_type: recommendation.recommendationType,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      reason: recommendation.reason,
      metadata: recommendation.metadata,
      status: recommendation.status,
      created_at: recommendation.createdAt,
      expires_at: recommendation.expiresAt,
      accepted_at: recommendation.acceptedAt,
      dismissed_at: recommendation.dismissedAt,
    })
    .select(tableColumns('session_recommendations'))
    .single();
  if (error) {
    throw new RepositoryError('createRecommendation', error);
  }
  return SessionRecommendationSchema.parse(data);
}

export async function updateRecommendationStatus(
  recommendationId: string,
  status: string,
  timestamp?: number,
): Promise<SessionRecommendation> {
  const updates: Record<string, unknown> = { status };
  if (timestamp) {
    if (status === 'ACCEPTED') {
      updates.accepted_at = timestamp;
    }
    if (status === 'DISMISSED') {
      updates.dismissed_at = timestamp;
    }
  }
  const { data, error } = await supabase
    .from('session_recommendations')
    .update(updates)
    .eq('id', recommendationId)
    .select(tableColumns('session_recommendations'))
    .single();
  if (error) {
    throw new RepositoryError('updateRecommendationStatus', error);
  }
  return SessionRecommendationSchema.parse(data);
}
