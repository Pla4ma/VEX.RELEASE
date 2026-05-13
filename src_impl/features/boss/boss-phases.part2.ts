import { eventBus } from "../../events";
import type { BossEncounter } from "./schemas";
import type { BossMechanicType } from "../../session/modes-enhanced";


export function handlePhaseTransition(encounter: BossEncounter, phaseState: BossPhaseState, newPhaseConfig: PhaseConfig, playerCurrentPurity: number, sessionPauseCount: number): PhaseTransitionResult {
  const warnings: string[] = [];
  let playerTookDamage = false;

  // Check if player meets phase requirements
  if (newPhaseConfig.requiredPurity && playerCurrentPurity < newPhaseConfig.requiredPurity) {
    warnings.push(`WARNING: Phase requires ${newPhaseConfig.requiredPurity}% purity. Current: ${playerCurrentPurity}%`);

    if (newPhaseConfig.playerCanTakeDamage) {
      playerTookDamage = true;
    }
  }

  // Check pause penalties for certain mechanics
  if (newPhaseConfig.mechanic === 'FOCUS_SHIELD' && sessionPauseCount > 0) {
    warnings.push('WARNING: Shield phase detected pauses. Streak at risk!');
    playerTookDamage = true;
  }

  // Check regeneration pause penalty
  if (newPhaseConfig.mechanic === 'REGENERATION' && sessionPauseCount > 0) {
    const regenAmount = Math.floor(encounter.maxHealth * 0.05 * sessionPauseCount);
    warnings.push(`Boss regenerated ${regenAmount} HP from pauses!`);
  }

  return {
    success: true,
    newPhase: phaseState.currentPhase,
    message: `Entered ${newPhaseConfig.name}`,
    playerTookDamage,
    damageType: newPhaseConfig.playerDamageType,
    warnings,
  };
}

export function startExecutePhase(phaseConfig: PhaseConfig, currentPurity: number): ExecutePhaseState {
  return {
    isActive: true,
    timeRemaining: phaseConfig.timeLimit || 120,
    requiredPurity: phaseConfig.requiredPurity || 90,
    currentPurity,
    startedAt: Date.now(),
    succeeded: null,
  };
}

export function updateExecutePhase(state: ExecutePhaseState, currentPurity: number, deltaTimeMs: number): { state: ExecutePhaseState; failed: boolean; reason: string | null } {
  const newTimeRemaining = state.timeRemaining - deltaTimeMs / 1000;

  // Check failure conditions
  if (newTimeRemaining <= 0) {
    return {
      state: { ...state, isActive: false, succeeded: false },
      failed: true,
      reason: 'Time expired',
    };
  }

  if (currentPurity < state.requiredPurity) {
    return {
      state: { ...state, isActive: false, succeeded: false },
      failed: true,
      reason: `Purity dropped below ${state.requiredPurity}%`,
    };
  }

  return {
    state: {
      ...state,
      timeRemaining: newTimeRemaining,
      currentPurity,
    },
    failed: false,
    reason: null,
  };
}

export function calculateRegeneration(encounter: BossEncounter, sessionPauseCount: number, phaseIntensity: number): { healthToRegen: number; regenState: RegenState } {
  const baseRegenPercent = 0.03; // 3% per pause
  const intensityMultiplier = 1 + phaseIntensity;
  const regenPercent = baseRegenPercent * intensityMultiplier;

  const healthToRegen = Math.floor(encounter.maxHealth * regenPercent * sessionPauseCount);

  const regenState: RegenState = {
    totalRegenerated: healthToRegen,
    regenPerPause: Math.floor(encounter.maxHealth * regenPercent),
    pauseCount: sessionPauseCount,
    lastRegenAt: Date.now(),
  };

  return { healthToRegen, regenState };
}

export function emitPhaseEvent(encounterId: string, userId: string, event: 'PHASE_ENTERED' | 'PHASE_FAILED' | 'EXECUTE_STARTED' | 'EXECUTE_FAILED' | 'EXECUTE_SUCCEEDED', data: Record<string, unknown>): void {
  eventBus.publish('boss:phase', {
    encounterId,
    userId,
    event,
    timestamp: Date.now(),
    data,
  });
}

export function getPhaseDisplayName(phase: BossPhase): string {
  const names: Record<BossPhase, string> = {
    PHASE_1: 'Phase 1: The Approach',
    PHASE_2: 'Phase 2: The Crucible',
    PHASE_3: 'Phase 3: The Execution',
    ENRAGED: 'ENRAGED!',
    EXECUTE: 'EXECUTE PHASE',
  };
  return names[phase];
}

export function getHealthPercent(healthRemaining: number, maxHealth: number): number {
  return Math.max(0, Math.min(1, healthRemaining / maxHealth));
}

export function shouldTriggerExecutePhase(healthPercent: number, phaseConfigs: PhaseConfig[]): boolean {
  const executeConfig = phaseConfigs.find((p) => p.healthThreshold <= 0.25);
  return healthPercent <= 0.25 && !!executeConfig?.timeLimit;
}