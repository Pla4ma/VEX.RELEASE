/**
 * Session Completion Offline Sync Integration
 *
 * Integrates the offline sync service with the existing session completion
 * workflow to ensure data is never lost.
 */

import { createDebugger } from '../../utils/debug';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';
import { useNetInfo } from '../../network/useNetInfo';
import { sessionCompletionOfflineSync } from './offline-sync-service';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
} from './schemas';
import { buildCompletionLedger, type BuildCompletionLedgerInput } from './ledger-service';

const debug = createDebugger('session-completion:offline-integration');

// ============================================================================
// Enhanced Session Completion with Offline Sync
// ============================================================================
// ============================================================================
// React Hook for Session Completion with Offline Sync
// ============================================================================
// ============================================================================
// Session Completion Recovery Utilities
// ============================================================================
// ============================================================================
// Session Completion Health Check
// ============================================================================
// ============================================================================
// Session Completion Sync Monitor
// ============================================================================
export * from "./offline-sync-integration.types";
export * from "./offline-sync-integration.part1";
export * from "./offline-sync-integration.part2";
