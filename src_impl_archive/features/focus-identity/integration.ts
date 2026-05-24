/**
 * DEPRECATED: Non-canonical focus-identity integration.
 * The canonical focus score update path is through the session-completion
 * orchestrator's completion-subsystems.ts -> updateFocusScoreFromSessionCompletion().
 * This integration is permanently disabled — it must NOT subscribe to session:completed.
 * Unique scoring logic has been moved into update-focus-score.helper.ts.
 */

export function initializeFocusIdentityIntegrations(): () => void {
  return () => {};
}
