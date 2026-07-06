import type { CompanionPhase } from '../types';

export const PHASE_MULTIPLIERS: Record<CompanionPhase, number> = {
  EGG: 0.5,
  HATCHING: 0.7,
  YOUNG: 0.85,
  MATURE: 1,
  AWAKENED: 1.2,
  TRANSCENDENT: 1.5,
};
