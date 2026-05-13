/**
 * Daily Rewards Repository
 * Persistence for D1-D7 login reward system
 */

import { getSupabaseClient } from '../../../config/supabase';
import { enqueue } from '../../../lib/offline/queue';
import { withRetry, RepositoryError } from '../../../lib/repository/base';
import { captureSilentFailure } from '../../../utils/silent-failure';
import { z } from 'zod';

const supabase = getSupabaseClient();

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Repository Functions
// ============================================================================
export * from "./daily.types";
export * from "./daily.part1";
export * from "./daily.part2";
