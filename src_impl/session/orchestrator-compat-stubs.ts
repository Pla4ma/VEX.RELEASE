/**
 * SessionOrchestrator Compatibility Stubs
 *
 * Extracted from SessionOrchestrator to keep file under 200 lines.
 * These stub methods maintain backward compatibility with hooks that
 * call these APIs but the full implementation is optional.
 */

import { createDebugger } from '../utils/debug';
import type { SessionState } from './types';

const debug = createDebugger('session:orchestrator:compat');

export function endBreak(): void {
  debug.info('endBreak called - not implemented');
}

export function updateFocusQuality(_quality: number): void {
  debug.info('updateFocusQuality called - not implemented');
}

export function logInterruption(
  _type: string,
  _details?: Record<string, unknown>,
): void {
  debug.info('logInterruption called - not implemented');
}

export function logRecovery(
  _type: string,
  _details?: Record<string, unknown>,
): void {
  debug.info('logRecovery called - not implemented');
}

export function addDocument(_documentId: string): void {
  debug.info('addDocument called - not implemented');
}

export function removeDocument(_documentId: string): void {
  debug.info('removeDocument called - not implemented');
}

export function getSessionHistory(_limit: number): SessionState[] {
  debug.info('getSessionHistory called - returning empty array');
  return [];
}

export function getSessionStats(): unknown {
  debug.info('getSessionStats called - returning empty stats');
  return {
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    completionRate: 0,
  };
}
