import type { ChallengeType } from './types';

export interface AssignChallengeInput {
  userId: string;
  seasonId: string;
  challengeType: ChallengeType;
  challengeId?: string;
}

export interface UpdateChallengeProgressInput {
  userId: string;
  challengeId: string;
  delta: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RerollChallengeInput {
  userId: string;
  challengeId: string;
  usePaidReroll: boolean;
  idempotencyKey?: string;
}

export interface ClaimChallengeRewardInput {
  userId: string;
  challengeId: string;
}
