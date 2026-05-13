/**
 * Session Event Types
 *
 * Typed event definitions for session-related events.
 * Extends the global EventChannels with session-specific events.
 */

import type { SessionState, SessionSummary, InterruptionRecord, RecoveryRecord, AntiCheatFlag } from './index';

// ============================================================================
// Session Event Channel Definitions
// ============================================================================
// ============================================================================
// Event Channel Names
// ============================================================================

export type SessionEventChannel = keyof SessionEventChannels;

// ============================================================================
// Event Payload Helper
// ============================================================================

export type SessionEventPayload<T extends SessionEventChannel> = SessionEventChannels[T];

export * from "./events.types";
