import { captureSilentFailure } from './silent-failure';
/**
 * Rate Limiter Utilities
 *
 * Prevents abuse and ensures fair usage across all features.
 * Sliding window and token bucket algorithms.
 *
 * @phase 12 - Deepening: Rate limiting
 */

import { MMKV } from 'react-native-mmkv';
import { createDebugger } from './debug';
import { eventBus } from '../events';

const debug = createDebugger('rate-limiter');

// ============================================================================
// Storage — lazy singleton to avoid crashing at module load time in Expo Go
// ============================================================================

let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'rate-limiter' });
  }
  return _storage;
}

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Sliding Window Rate Limiter
// ============================================================================
// ============================================================================
// Token Bucket Rate Limiter
// ============================================================================

interface BucketState {
  tokens: number;
  lastRefill: number;
}

// ============================================================================
// Predefined Rate Limits
// ============================================================================
// ============================================================================
// Rate Limit Check Helper
// ============================================================================
// ============================================================================
// Error
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export default RateLimiter;

export * from "./rate-limiter.types";
export * from "./rate-limiter.types";
export * from "./rate-limiter.part1";
export * from "./rate-limiter.part2";
