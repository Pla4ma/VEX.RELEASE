/**
 * Session Orchestrator Factory
 * Factory functions for creating orchestrator instances
 */

import { SessionOrchestrator } from './SessionOrchestrator';
import type { OrchestratorConfig } from './orchestrator-types';

export function createSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  return new SessionOrchestrator(config);
}

let orchestratorInstance: SessionOrchestrator | null = null;

export function getSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SessionOrchestrator(config);
  }
  return orchestratorInstance;
}
