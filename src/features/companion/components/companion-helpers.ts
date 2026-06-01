import { CompanionPhase } from '../types';

export function getPhaseMultiplier(phase: CompanionPhase): number {
  const multipliers: Record<CompanionPhase, number> = {
    EGG: 0.5,
    HATCHING: 0.7,
    YOUNG: 0.85,
    MATURE: 1,
    AWAKENED: 1.2,
    TRANSCENDENT: 1.5,
  };
  return multipliers[phase];
}
