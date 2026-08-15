/**
 * Shared session-analytics orchestration flag (extracted to break a
 * require cycle between SessionAnalytics.ts and session-analytics-listeners.ts).
 */

let orchestratorHandlesCompletion = false;

export function setOrchestratorHandlesCompletion(v: boolean): void {
  orchestratorHandlesCompletion = v;
}

export function getOrchestratorHandlesCompletion(): boolean {
  return orchestratorHandlesCompletion;
}
