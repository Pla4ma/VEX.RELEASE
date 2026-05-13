import { eventBus } from "../../events";
import type { BossEncounter } from "./schemas";
import type { BossMechanicType } from "../../session/modes-enhanced";


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

export function calculateCurrentPhase(healthPercent: number, phaseConfigs: PhaseConfig[], currentState: BossPhaseState): { phase: BossPhase; config: PhaseConfig; changed: boolean } {
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