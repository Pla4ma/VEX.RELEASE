import type { CompletionUnlockDecision } from '../session-completion/schemas';
import { createUnlockDecision } from './service';
import type { UnlockDecision } from './types';

/**
 * Completion Integration Bridge — connects the session-completion
 * unlock flow to the unlock-explainer trust layer.
 *
 * CompletionUnlockDecision → UnlockDecision → evidence-based reason.
 */

const COMPLETION_KEY_MAP: Record<string, string> = {
  project_thread: 'project_thread',
  run_board: 'run_board',
  study_os: 'study_os',
  today_strip: 'today_strip',
};

/**
 * Build a completion unlock decision that uses the unlock-explainer's
 * evidence-based reasoning instead of a hardcoded lane map.
 */
export function buildCompletionUnlock(
  featureKey: string,
  sessionCount: number,
  lane?: string,
  hiddenFeatureKeys: string[] = [],
): CompletionUnlockDecision {
  const mappedKey = COMPLETION_KEY_MAP[featureKey] ?? featureKey;
  const hidden = hiddenFeatureKeys.includes(mappedKey);

  const decision = createUnlockDecision({
    featureKey: mappedKey,
    laneProfile: lane as
      | 'student'
      | 'game_like'
      | 'deep_creative'
      | 'minimal_normal'
      | undefined,
    sessionCount,
    isPremium: false,
    hasRelatedBehavior: false,
  });

  if (hidden) {
    return {
      hidden: true,
      key: mappedKey as CompletionUnlockDecision['key'],
      reason: decision.userFacingReason,
      status: 'blocked',
    };
  }

  return {
    hidden: false,
    key: mappedKey as CompletionUnlockDecision['key'],
    reason: decision.userFacingReason,
    status:
      decision.decision === 'unlocked'
        ? 'available'
        : decision.decision === 'teased'
          ? 'teased'
          : 'blocked',
  };
}

/**
 * Map an UnlockDecision to CompletionUnlockDecision format.
 */
export function unlockDecisionToCompletion(
  decision: UnlockDecision,
  isHidden: boolean,
): CompletionUnlockDecision {
  const key = decision.featureKey as CompletionUnlockDecision['key'];

  if (isHidden) {
    return {
      hidden: true,
      key,
      reason: decision.userFacingReason,
      status: 'blocked',
    };
  }

  return {
    hidden: false,
    key,
    reason: decision.userFacingReason,
    status:
      decision.decision === 'unlocked'
        ? 'available'
        : decision.decision === 'teased'
          ? 'teased'
          : 'blocked',
  };
}
