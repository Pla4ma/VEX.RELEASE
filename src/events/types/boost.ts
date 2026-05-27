/**
 * Boost Events
 */

export interface BoostEventDefinitions {
  "boosts:activate": {
    userId: string;
    boostType: string;
    multiplier: number;
    duration: number;
  };
  "progression:activate_boost": {
    userId: string;
    boostType: string;
    duration: number;
    multiplier: number;
  };
}
