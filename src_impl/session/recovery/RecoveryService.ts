/**
 * Recovery Service
 *
 * Handles session recovery logic including:
 * - Auto-recovery from interruptions
 * - Streak protection
 * - Partial credit grants
 * - Recovery penalty calculations
 */

import type { SessionState, RecoveryRecord, RecoveryType, InterruptionRecord } from '../types';
import { v4 as uuidv4 } from '../../utils/uuid';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:recovery');

// ============================================================================
// Recovery Configuration
// ============================================================================

interface RecoveryConfig {
  autoRecoveryEnabled: boolean;
  autoRecoveryDelay: number;
  streakProtectionEnabled: boolean;
  partialCreditThreshold: number;
  maxRecoveriesPerSession: number;
}

// ============================================================================
// Recovery Service
// ============================================================================
// ============================================================================
// Factory Function
// ============================================================================
// ============================================================================
// Singleton
// ============================================================================

let serviceInstance: RecoveryService | null = null;
export * from "./RecoveryService.types";
export * from "./RecoveryService.types";
export * from "./RecoveryService.part1";
export * from "./RecoveryService.part2";
