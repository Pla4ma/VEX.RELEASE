/**
 * Basic Challenges Hooks
 *
 * React hooks for the simplified challenges system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import * as service from '../basic-challenges-service';
import type { BasicChallengeProgressResult, BasicChallengeClaimResult } from '../basic-challenges-service';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('challenges:hooks');

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Basic Challenges Status Hook
// ============================================================================
// ============================================================================
// Daily Challenge Hook
// ============================================================================
// ============================================================================
// Weekly Challenge Hook
// ============================================================================
// ============================================================================
// Challenge Progress Hook
// ============================================================================
// ============================================================================
// Challenge Reward Claim Hook
// ============================================================================
// ============================================================================
// Combined Challenges Hook for Home Screen
// ============================================================================
export * from "./basic-challenges-hooks.part1";
