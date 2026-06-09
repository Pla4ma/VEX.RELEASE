import { getSupabaseClient } from '../../config/supabase';
import {
  ChallengeSchema,
  type Challenge,
  type ChallengeTemplate,
  type _UserChallenge,
  ChallengeTemplateSchema,
  _UserChallengeSchema,
} from './schemas';
import {
  RepositoryError,
  _baseJoinedSelect,
  _mapJoinedChallenge,
} from './repository-helpers';
import type {} from './schemas';

const supabase = getSupabaseClient();

export { RepositoryError } from './repository-helpers';

export async function fetchChallengeById(
  challengeId: string,
): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('id,season_id,type,category,title,description,icon_url,target_value,target_type,reward_type,reward_amount,reward_item_id,start_at,end_at,is_active,difficulty,xp_bonus,created_at')
    .eq('id', challengeId)
    .maybeSingle();
  if (error) {
    throw new RepositoryError('fetchChallengeById', error);
  }
  return data ? ChallengeSchema.parse(data) : null;
}

export async function fetchActiveChallenges(
  seasonId: string,
): Promise<Challenge[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('challenges')
    .select('id,season_id,type,category,title,description,icon_url,target_value,target_type,reward_type,reward_amount,reward_item_id,start_at,end_at,is_active,difficulty,xp_bonus,created_at')
    .eq('season_id', seasonId)
    .eq('is_active', true)
    .lte('start_at', now)
    .gte('end_at', now);
  if (error) {
    throw new RepositoryError('fetchActiveChallenges', error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengesByType(
  seasonId: string,
  type: 'DAILY' | 'WEEKLY' | 'EVENT',
): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('id,season_id,type,category,title,description,icon_url,target_value,target_type,reward_type,reward_amount,reward_item_id,start_at,end_at,is_active,difficulty,xp_bonus,created_at')
    .eq('season_id', seasonId)
    .eq('type', type)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchChallengesByType', error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengeTemplates(): Promise<ChallengeTemplate[]> {
  const { data, error } = await supabase
    .from('challenge_templates')
    .select('id,category,type,title_template,description_template,min_target,max_target,min_reward,max_reward,reward_type,weight,min_level,requires_premium,requires_squad,is_active')
    .eq('is_active', true);
  if (error) {
    throw new RepositoryError('fetchChallengeTemplates', error);
  }
  return (data ?? []).map((row) => ChallengeTemplateSchema.parse(row));
}
