/**
 * Reward Adapter
 *
 * Integrates the session system with the reward system.
 * Handles reward calculation and distribution based on session performance.
 */

import { eventBus } from '../../events';
import { getRewardService } from '../../rewards/RewardService';
import type { SessionSummary } from '../types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:rewardAdapter');

// ============================================================================
// Reward Adapter
// ============================================================================
// ============================================================================
// Factory Function
// ============================================================================
// ============================================================================
// Singleton
// ============================================================================

let adapterInstance: RewardAdapter | null = null;

export * from "./RewardAdapter.part1";
export * from "./RewardAdapter.part2";
