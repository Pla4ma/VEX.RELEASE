import { TimerEngine } from "./engines/TimerEngine";
import { ScoringEngine } from "./engines/ScoringEngine";
import { CompletionEngine } from "./engines/CompletionEngine";
import { AntiCheatEngine } from "./antiCheat/AntiCheatEngine";
import { SessionEventEmitter } from "./SessionEventEmitter";
import { getSessionRepository } from "./repository/SessionRepository";
import { FlowPulseEngine } from "./engines/FlowPulseEngine";
import { CompanionPresenceEngine } from "./engines/CompanionPresenceEngine";
import { RestPhaseChallengeEngine } from "./engines/RestPhaseChallengeEngine";
import { BossAbilityEngine } from "./engines/BossAbilityEngine";
import type { SessionState, SessionConfig, InterruptionType, InterruptionSeverity, InterruptionRecord, RecoveryRecord, FocusQualityMetrics, SessionSummary } from "./types";
import type { FlowState, BossAbilityType, BossAbilityState, CompanionTappedEvent, RestChallengeCompletedEvent } from "./engines/micro-interaction-types";
import { v4 as uuidv4 } from "../utils/uuid";
import { createDebugger } from "../utils/debug";
import type { OrchestratorConfig } from "./orchestrator-types";
import * as persistence from "./SessionPersistence";


export function getSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SessionOrchestrator(config);
  }
  return orchestratorInstance;
}

export function createSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  return new SessionOrchestrator(config);
}