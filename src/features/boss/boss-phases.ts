/**
 * Boss Battle Phases - VEX 10/10 Transformation
 *
 * Adds tactical depth to boss encounters:
 * - Multi-phase boss battles
 * - Enrage mechanics that punish pausing
 * - Execute mechanics requiring skill
 * - Dynamic difficulty adjustment
 *
 * @phase 1B - Core Loop Surgery
 */

import { eventBus } from '../../events';
import type { BossEncounter } from './schemas';
import type { BossMechanicType } from '../../session/modes-enhanced';

// ============================================================================
// Phase Configuration Types
// ============================================================================

export type BossPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'ENRAGED' | 'EXECUTE';

export interface PhaseConfig {
  name: string;
  healthThreshold: number; // 0-1, triggers when health drops below this
  mechanic: BossMechanicType;
  mechanicIntensity: number; // 0-1
  playerCanTakeDamage: boolean;
  playerDamageType: 'STREAK_RISK' | 'XP_PENALTY' | 'COIN_PENALTY' | 'NONE';
  requiredPurity?: number; // Minimum purity to survive phase
  timeLimit?: number; // Seconds to complete phase (for execute)
  damageMultiplier: number; // Damage dealt TO boss in this phase
  incomingDamageMultiplier: number; // Damage dealt BY boss (if applicable)
  visualIntensity: 'normal' | 'intense' | 'critical';
  audioCue: string;
}

export interface BossPhaseState {
  currentPhase: BossPhase;
  previousPhase: BossPhase | null;
  phaseEnteredAt: number;
  phaseHealthStart: number;
  mechanicActive: boolean;
  mechanicData: Record<string, unknown>;
  executeWindowOpen: boolean;
  playerWarningsIssued: number;
}

// ============================================================================
// Boss Phase Templates by Difficulty
// ============================================================================

export const BOSS_PHASE_TEMPLATES: Record<string, PhaseConfig[]> = {
  standard: [
    {
      name: 'The Approach',
      healthThreshold: 1.0,
      mechanic: 'REGENERATION',
      mechanicIntensity: 0.0,
      playerCanTakeDamage: false,
      playerDamageType: 'NONE',
      damageMultiplier: 1.0,
      incomingDamageMultiplier: 0.0,
      visualIntensity: 'normal',
      audioCue: 'boss_phase1_start',
    },
    {
      name: 'The Crucible',
      healthThreshold: 0.5,
      mechanic: 'FOCUS_SHIELD',
      mechanicIntensity: 0.5,
      playerCanTakeDamage: true,
      playerDamageType: 'STREAK_RISK',
      requiredPurity: 85,
      damageMultiplier: 1.2,
      incomingDamageMultiplier: 1.0,
      visualIntensity: 'intense',
      audioCue: 'boss_phase2_start',
    },
    {
      name: 'The Execution',
      healthThreshold: 0.25,
      mechanic: 'FOCUS_SHIELD',
      mechanicIntensity: 0.8,
      playerCanTakeDamage: true,
      playerDamageType: 'STREAK_RISK',
      requiredPurity: 90,
      timeLimit: 120, // 2 minutes to finish
      damageMultiplier: 1.5,
      incomingDamageMultiplier: 2.0,
      visualIntensity: 'critical',
      audioCue: 'boss_execute_phase',
    },
  ],

  regeneration_boss: [
    {
      name: 'Dormant',
      healthThreshold: 1.0,
      mechanic: 'REGENERATION',
      mechanicIntensity: 0.3,
      playerCanTakeDamage: false,
      playerDamageType: 'NONE',
      damageMultiplier: 1.0,
      incomingDamageMultiplier: 0.0,
      visualIntensity: 'normal',
      audioCue: 'regen_phase1',
    },
    {
      name: 'Regenerating Fury',
      healthThreshold: 0.6,
      mechanic: 'REGENERATION',
      mechanicIntensity: 0.7,
      playerCanTakeDamage: true,
      playerDamageType: 'COIN_PENALTY',
      damageMultiplier: 0.8, // Harder to damage
      incomingDamageMultiplier: 1.0,
      visualIntensity: 'intense',
      audioCue: 'regen_phase2',
    },
    {
      name: 'Final Surge',
      healthThreshold: 0.3,
      mechanic: 'REGENERATION',
      mechanicIntensity: 1.0,
      playerCanTakeDamage: true,
      playerDamageType: 'STREAK_RISK',
      timeLimit: 180,
      damageMultiplier: 1.0,
      incomingDamageMultiplier: 1.5,
      visualIntensity: 'critical',
      audioCue: 'regen_phase3',
    },
  ],

  sprint_boss: [
    {
      name: 'The Race Begins',
      healthThreshold: 1.0,
      mechanic: 'COUNTDOWN',
      mechanicIntensity: 0.0,
      playerCanTakeDamage: false,
      playerDamageType: 'NONE',
      damageMultiplier: 1.0,
      incomingDamageMultiplier: 0.0,
      visualIntensity: 'normal',
      audioCue: 'sprint_phase1',
    },
    {
      name: 'Accelerating',
      healthThreshold: 0.75,
      mechanic: 'COUNTDOWN',
      mechanicIntensity: 0.5,
      playerCanTakeDamage: false,
      playerDamageType: 'NONE',
      damageMultiplier: 1.1,
      incomingDamageMultiplier: 0.0,
      visualIntensity: 'intense',
      audioCue: 'sprint_phase2',
    },
    {
      name: 'The Finish Line',
      healthThreshold: 0.25,
      mechanic: 'COUNTDOWN',
      mechanicIntensity: 0.8,
      playerCanTakeDamage: true,
      playerDamageType: 'XP_PENALTY',
      timeLimit: 60,
      damageMultiplier: 1.3,
      incomingDamageMultiplier: 1.0,
      visualIntensity: 'critical',
      audioCue: 'sprint_phase3',
    },
  ],
};

// ============================================================================
// Phase State Management
// ============================================================================

export function createInitialPhaseState(): BossPhaseState {
  return {
    currentPhase: 'PHASE_1',
    previousPhase: null,
    phaseEnteredAt: Date.now(),
    phaseHealthStart: 100,
    mechanicActive: false,
    mechanicData: {},
    executeWindowOpen: false,
    playerWarningsIssued: 0,
  };
}

export function calculateCurrentPhase(
  healthPercent: number,
  phaseConfigs: PhaseConfig[],
  currentState: BossPhaseState
): { phase: BossPhase; config: PhaseConfig; changed: boolean } {
  // Find which phase we should be in based on health
  let targetPhaseIndex = 0;
  for (let i = 0; i < phaseConfigs.length; i++) {
    if (healthPercent <= phaseConfigs[i].healthThreshold) {
      targetPhaseIndex = i;
    }
  }

  const phaseMap: BossPhase[] = ['PHASE_1', 'PHASE_2', 'PHASE_3', 'ENRAGED'];
  const targetPhase = phaseMap[targetPhaseIndex] || 'PHASE_1';
  const changed = targetPhase !== currentState.currentPhase;

  return {
    phase: targetPhase,
    config: phaseConfigs[targetPhaseIndex],
    changed,
  };
}

// ============================================================================
// Phase Transition Logic
// ============================================================================

export interface PhaseTransitionResult {
  success: boolean;
  newPhase: BossPhase;
  message: string;
  playerTookDamage: boolean;
  damageType: 'STREAK_RISK' | 'XP_PENALTY' | 'COIN_PENALTY' | 'NONE';
  warnings: string[];
}

export function handlePhaseTransition(
  encounter: BossEncounter,
  phaseState: BossPhaseState,
  newPhaseConfig: PhaseConfig,
  playerCurrentPurity: number,
  sessionPauseCount: number
): PhaseTransitionResult {
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

// ============================================================================
// Execute Phase Mechanics
// ============================================================================

export interface ExecutePhaseState {
  isActive: boolean;
  timeRemaining: number;
  requiredPurity: number;
  currentPurity: number;
  startedAt: number;
  succeeded: boolean | null;
}

export function startExecutePhase(
  phaseConfig: PhaseConfig,
  currentPurity: number
): ExecutePhaseState {
  return {
    isActive: true,
    timeRemaining: phaseConfig.timeLimit || 120,
    requiredPurity: phaseConfig.requiredPurity || 90,
    currentPurity,
    startedAt: Date.now(),
    succeeded: null,
  };
}

export function updateExecutePhase(
  state: ExecutePhaseState,
  currentPurity: number,
  deltaTimeMs: number
): { state: ExecutePhaseState; failed: boolean; reason: string | null } {
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

// ============================================================================
// Regeneration Mechanics
// ============================================================================

export interface RegenState {
  totalRegenerated: number;
  regenPerPause: number;
  pauseCount: number;
  lastRegenAt: number | null;
}

export function calculateRegeneration(
  encounter: BossEncounter,
  sessionPauseCount: number,
  phaseIntensity: number
): { healthToRegen: number; regenState: RegenState } {
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

// ============================================================================
// Phase Events & Analytics
// ============================================================================

export function emitPhaseEvent(
  encounterId: string,
  userId: string,
  event: 'PHASE_ENTERED' | 'PHASE_FAILED' | 'EXECUTE_STARTED' | 'EXECUTE_FAILED' | 'EXECUTE_SUCCEEDED',
  data: Record<string, unknown>
): void {
  eventBus.publish('boss:phase', {
    encounterId,
    userId,
    event,
    timestamp: Date.now(),
    data,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

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

export function shouldTriggerExecutePhase(
  healthPercent: number,
  phaseConfigs: PhaseConfig[]
): boolean {
  const executeConfig = phaseConfigs.find((p) => p.healthThreshold <= 0.25);
  return healthPercent <= 0.25 && !!executeConfig?.timeLimit;
}
