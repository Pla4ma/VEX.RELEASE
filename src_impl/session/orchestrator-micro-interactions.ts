/**
 * SessionOrchestrator Micro-Interaction Public API
 *
 * Extracted from SessionOrchestrator to keep file under 200 lines.
 * Handles companion taps, boss abilities, rest challenges, flow state queries.
 */

import type { FlowState, BossAbilityType, BossAbilityState, CompanionTappedEvent, RestChallengeCompletedEvent } from './engines/micro-interaction-types';
import type { FlowPulseEngine } from './engines/FlowPulseEngine';
import type { CompanionPresenceEngine } from './engines/CompanionPresenceEngine';
import type { RestPhaseChallengeEngine } from './engines/RestPhaseChallengeEngine';
import type { BossAbilityEngine } from './engines/BossAbilityEngine';
import type { SessionState } from './types';

export interface MicroInteractionEngines {
  flowPulseEngine: FlowPulseEngine;
  companionPresenceEngine: CompanionPresenceEngine;
  restChallengeEngine: RestPhaseChallengeEngine;
  bossAbilityEngine: BossAbilityEngine;
  previousFlowState: FlowState;
  nextPhaseQualityMultiplier: number;
  session: SessionState | null;
}

export function tapCompanion(engines: MicroInteractionEngines): CompanionTappedEvent | null {
  return engines.companionPresenceEngine.tapCompanion();
}

export function activateBossAbility(
  engines: MicroInteractionEngines,
  abilityType: BossAbilityType,
): boolean {
  const result = engines.bossAbilityEngine.activateAbility(abilityType);
  if (result && engines.session) {
    engines.session.metadata = {
      ...(engines.session.metadata ?? {}),
      lastAbilityUsed: abilityType,
      lastAbilityUsedAt: Date.now(),
    };
  }
  return !!result;
}

export function completeRestChallenge(
  engines: MicroInteractionEngines,
): RestChallengeCompletedEvent | null {
  const result = engines.restChallengeEngine.completeChallenge();
  if (result) {
    engines.nextPhaseQualityMultiplier = result.nextPhaseQualityMultiplier;
  }
  return result;
}

export function skipRestChallenge(engines: MicroInteractionEngines): void {
  engines.restChallengeEngine.skipChallenge();
}

export function getFlowState(engines: MicroInteractionEngines): FlowState {
  return engines.flowPulseEngine.getFlowState();
}

export function getFlowPulseQuality(engines: MicroInteractionEngines): number {
  const state = engines.previousFlowState;
  if (state === 'DEEP_FLOW') return 1;
  if (state === 'FLOW') return 0.7;
  if (state === 'SHALLOW') return 0.4;
  return 0.1;
}

export function getBossAbilityStates(engines: MicroInteractionEngines): BossAbilityState[] {
  return engines.bossAbilityEngine.getAbilityStates();
}

export function isBossAttacking(engines: MicroInteractionEngines): boolean {
  return engines.bossAbilityEngine.isBossAttacking();
}

export function getPurityAccelerationBonus(engines: MicroInteractionEngines): number {
  return engines.flowPulseEngine.getPurityAccelerationBonus();
}

export function getNextPhaseQualityMultiplier(engines: MicroInteractionEngines): number {
  return engines.nextPhaseQualityMultiplier;
}

export function setBossActive(engines: MicroInteractionEngines, active: boolean): void {
  engines.bossAbilityEngine.setBossActive(active);
}
