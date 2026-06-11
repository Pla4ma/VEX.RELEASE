import { SessionOrchestrator } from './SessionOrchestrator';
import { loadActiveSession } from './orchestrators/SessionCore';
import type { OrchestratorConfig } from './orchestrator-types';

let orchestratorInstance: SessionOrchestrator | null = null;
let sessionLoaded = false;

export function getSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SessionOrchestrator(config);
  }
  if (!sessionLoaded) {
    sessionLoaded = true;
    loadActiveSession(orchestratorInstance);
  }
  return orchestratorInstance;
}

export function resetSessionOrchestrator(): void {
  if (orchestratorInstance) { orchestratorInstance.destroy(); orchestratorInstance = null; sessionLoaded = false; }
}

export function createSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  const inst = new SessionOrchestrator(config);
  loadActiveSession(inst);
  return inst;
}
