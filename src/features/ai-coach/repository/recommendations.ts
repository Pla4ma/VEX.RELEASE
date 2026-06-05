import { getSupabaseClient } from '../../../config/supabase';
import { z } from 'zod';
import {
  SessionRecommendationSchema,
  type SessionRecommendation,
  type RecommendationType,
} from '../schemas';
import { RepositoryError } from './error';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();
const RecommendationRowSchema = z.object({
  accepted_at: z.number().int().positive().nullable().optional(),
  based_on: z.array(z.unknown()).nullable().optional(),
  confidence: z.number().nullable().optional(),
  created_at: z.number().int().positive(),
  description: z.string(),
  dismissed_at: z.number().int().positive().nullable().optional(),
  expires_at: z.number().int().positive(),
  id: z.string().uuid(),
  metadata: z.record(z.unknown()).nullable().optional(),
  priority: z.number().int(),
  reason: z.string(),
  reasoning: z.string().nullable().optional(),
  recommendation_type: z.string(),
  status: z.string(),
  suggested_difficulty: z.string().nullable().optional(),
  suggested_duration: z.number().int().nullable().optional(),
  title: z.string(),
  user_id: z.string().uuid(),
});

function parseRecommendationRow(row: unknown): SessionRecommendation {
  const parsed = RecommendationRowSchema.parse(row);
  return SessionRecommendationSchema.parse({
    acceptedAt: parsed.accepted_at ?? null,
    basedOn: parsed.based_on ?? [],
    confidence: parsed.confidence ?? undefined,
    createdAt: parsed.created_at,
    description: parsed.description,
    dismissedAt: parsed.dismissed_at ?? null,
    expiresAt: parsed.expires_at,
    id: parsed.id,
    metadata: parsed.metadata ?? {},
    priority: parsed.priority,
    reason: parsed.reason,
    reasoning: parsed.reasoning ?? undefined,
    recommendationType: parsed.recommendation_type,
    status: parsed.status,
    suggestedDifficulty: parsed.suggested_difficulty ?? undefined,
    suggestedDuration: parsed.suggested_duration ?? undefined,
    title: parsed.title,
    userId: parsed.user_id,
  });
}

function parseRecommendationRows(rows: unknown[] | null): SessionRecommendation[] {
  return (rows ?? []).map((row) => parseRecommendationRow(row));
}

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
  return parseRecommendationRows(data);
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
  return parseRecommendationRows(data);
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
  return parseRecommendationRows(data);
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
  return parseRecommendationRow(data);
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
  return parseRecommendationRow(data);
}
