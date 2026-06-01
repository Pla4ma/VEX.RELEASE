import type { CompanionPhase, CompanionState } from '../types';
import { ELEMENT_THEMES } from '../types';

export type EvolutionPhase =
  | 'energy-buildup'
  | 'flash'
  | 'transformation'
  | 'celebration'
  | 'complete';

export interface CompanionEvolutionCeremonyProps {
  previousState: CompanionState;
  newPhase: CompanionPhase;
  onComplete: () => void;
}

export const PHASE_NAMES: Record<CompanionPhase, string> = {
  EGG: 'Egg',
  HATCHING: 'Hatching',
  YOUNG: 'Young',
  MATURE: 'Mature',
  AWAKENED: 'Awakened',
  TRANSCENDENT: 'Transcendent',
};

export const PHASE_EMOJIS: Record<CompanionPhase, string> = {
  EGG: '🥚',
  HATCHING: '🐣',
  YOUNG: '🐤',
  MATURE: '🦅',
  AWAKENED: '🐉',
  TRANSCENDENT: '🌟',
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type ElementThemeColors = ReturnType<typeof getElementThemeColors>;

export function getElementThemeColors(element: CompanionState['element']) {
  return ELEMENT_THEMES[element];
}
