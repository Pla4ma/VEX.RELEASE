/**
 * Squad War Events
 */

export interface SquadWarEventDefinitions {
  'squad-war:ended': {
    squadId: string;
    warId: string;
    winner: string;
    participants: string[];
  };
}
