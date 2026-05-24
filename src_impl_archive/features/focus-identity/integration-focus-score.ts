/**
 * Non-canonical focus score integration — DISABLED.
 * The canonical path is completed through the session-completion orchestrator's
 * completion-subsystems.ts -> updateFocusScoreFromSessionCompletion().
 * The unique contract signal and score algorithm logic lives in
 * update-focus-score.helper.ts and score-algorithm.ts.
 * This function must NOT independently subscribe to session:completed.
 */

export function initializeFocusScoreIntegration(): () => void {
  return () => {};
}
