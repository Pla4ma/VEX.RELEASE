/**
 * VexAction utility types and result builders.
 *
 * Internal — no UI dependency, no direct Supabase access.
 * Shared between service.ts wrappers and action tests.
 */

import type { VexActionName, VexActionResult } from './schemas';

// ============================================================================
// Feature gate
// ============================================================================

/** Feature keys that gate specific actions. Matches `FeatureKey` in liveops-config. */
export type ActionFeatureKey = 'focus_session' | 'content_study' | 'focus_memory';

/** Simplified gate: caller provides `isAvailable` from FeatureAvailability.canQuery */
export interface ActionGate {
  isAvailable: boolean;
  reason: string;
}

/** Maps each action to its required feature key and gate mode. */
export const ACTION_FEATURE_MAP: Record<VexActionName, { featureKey: ActionFeatureKey | null; gateMode: string }> = {
  create_focus_session: { featureKey: 'focus_session', gateMode: 'query' },
  start_session: { featureKey: 'focus_session', gateMode: 'query' },
  complete_reflection: { featureKey: 'focus_session', gateMode: 'query' },
  start_rescue: { featureKey: 'focus_session', gateMode: 'query' },
  schedule_focus_window: { featureKey: 'focus_session', gateMode: 'query' },
  create_study_block: { featureKey: 'content_study', gateMode: 'query' },
  update_project_thread: { featureKey: 'focus_session', gateMode: 'query' },
  read_memory_summary: { featureKey: 'focus_memory', gateMode: 'query' },
  update_lane_override: { featureKey: null, gateMode: 'none' },
};

// ============================================================================
// Result builders — generic for assignability to any VexActionResult<T>
// ============================================================================

export function success<T>(data: T): VexActionResult<T> {
  return { status: 'success', errorMessage: null, data };
}

export function blocked<T = null>(actionName: VexActionName, reason: string): VexActionResult<T> {
  return {
    status: 'feature_blocked',
    errorMessage: `Action "${actionName}" blocked: ${reason}`,
    data: null as T,
  };
}

export function validationError<T = null>(actionName: VexActionName, message: string): VexActionResult<T> {
  return {
    status: 'validation_error',
    errorMessage: `Action "${actionName}" validation failed: ${message}`,
    data: null as T,
  };
}

export function repoError<T = null>(actionName: VexActionName, message: string): VexActionResult<T> {
  return {
    status: 'repository_error',
    errorMessage: `Action "${actionName}" repository error: ${message}`,
    data: null as T,
  };
}

export function notFound<T = null>(actionName: VexActionName, message: string): VexActionResult<T> {
  return {
    status: 'not_found',
    errorMessage: `Action "${actionName}" not found: ${message}`,
    data: null as T,
  };
}

// ============================================================================
// Gate check
// ============================================================================

export function checkFeatureGate<T = null>(
  actionName: VexActionName,
  gate: ActionGate | null,
): VexActionResult<T> | null {
  const mapping = ACTION_FEATURE_MAP[actionName];
  if (!mapping || mapping.featureKey === null || mapping.gateMode === 'none') {
    return null;
  }
  if (!gate) {
    return null;
  }
  if (!gate.isAvailable) {
    return blocked<T>(actionName, gate.reason);
  }
  return null;
}

// ============================================================================
// Public helpers
// ============================================================================

export function checkActionFeatureGate(
  actionName: VexActionName,
): ActionGate | null {
  const mapping = ACTION_FEATURE_MAP[actionName];
  if (!mapping || mapping.featureKey === null) {
    return null;
  }
  return {
    isAvailable: true,
    reason: `Requires feature "${mapping.featureKey}" to be available`,
  };
}

export function getActionFeatureKey(
  actionName: VexActionName,
): ActionFeatureKey | null {
  return ACTION_FEATURE_MAP[actionName].featureKey;
}
