/**
 * Rewards Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { z } from 'zod';
import * as service from '../service';
import * as repository from '../repository';
import { getRewardLedger, getTodayRewardSummary, type RewardLedgerEntry } from '../ledger-service';
import { CreateRewardInputSchema, ClaimRewardInputSchema, CalculateRewardInputSchema, type CreateRewardInput, type ClaimRewardInput, type CalculateRewardInput, type RewardCalculation, type Reward } from '../schemas';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Read Hooks
// ============================================================================
type VaultChest = {
  id: string;
  tier: 'WOOD' | 'SILVER' | 'GOLD' | 'LEGENDARY';
  obtainedAt: number;
  source: 'SESSION' | 'BOSS' | 'DAILY' | 'ACHIEVEMENT';
  isOpened: boolean;
};
// ============================================================================
// Mutation Hooks
// ============================================================================
// ============================================================================
// Calculator Hook
// ============================================================================
// ============================================================================
// Batch Claim Hook
// ============================================================================
// ============================================================================
// Ledger Hooks
// ============================================================================
// ============================================================================
// Daily Login Hook
// ============================================================================

import { fetchDailyRewardsState, saveDailyRewardClaim, type UserDailyRewardsState } from '../repository/daily';
import { eventBus } from '../../../events';
import { trackDailyLoginClaimed } from '../analytics';

const dailyLoginKeys = {
  all: ['daily-login'] as const,
  byUser: (userId: string) => [...dailyLoginKeys.all, 'user', userId] as const,
};
export * from "./index.types";
export * from "./index.part1";
export * from "./index.part2";
