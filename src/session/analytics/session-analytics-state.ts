/**
 * Shared orchestrator-completion flag for session analytics.
 * Extracted to break the circular dependency between
 * SessionAnalytics ↔ session-analytics-listeners.
 */

let orchestratorHandlesCompletion = false;

export function setOrchestratorHandlesCompletion(v: boolean): void {
  orchestratorHandlesCompletion = v;
}

export function getOrchestratorHandlesCompletion(): boolean {
  return orchestratorHandlesCompletion;
}
