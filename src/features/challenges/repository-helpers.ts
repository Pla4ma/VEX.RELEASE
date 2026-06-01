import { getSupabaseClient } from '../../config/supabase';
import {
  ChallengeDetailSchema,
  ChallengeSchema,
  UserChallengeSchema,
  type ChallengeDetail,
} from './schemas';

const supabase = getSupabaseClient();

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(`Repository error in ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

export const baseJoinedSelect = `
  id,
  user_id,
  challenge_id,
  current_value,
  status,
  assigned_at,
  completed_at,
  claimed_at,
  expires_at,
  reroll_count,
  created_at,
  challenges (*)
`;

export const mapJoinedChallenge = (row: Record<string, unknown>): ChallengeDetail => {
  const challenge = ChallengeSchema.parse(row.challenges);
  const userChallenge = UserChallengeSchema.parse(row);
  const xpReward = challenge.rewardAmount;
  const coinReward =
    challenge.rewardAmount >= 500
      ? 250
      : challenge.rewardAmount >= 250
        ? 100
        : 50;
  return ChallengeDetailSchema.parse({
    challenge,
    userChallenge,
    xpReward,
    coinReward,
    requiredCount: challenge.targetValue,
  });
};
