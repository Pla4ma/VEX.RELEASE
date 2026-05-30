/**
 * Duel Events
 */

export interface DuelEventDefinitions {
  "duel:completed": {
    winnerId?: string;
    challengerId?: string;
    challengedId?: string;
  };
}
