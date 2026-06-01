/**
 * Seasons Events
 */

export interface SeasonsEventDefinitions {
  'seasons:challenge_progress': {
    userId: string;
    challengeId: string;
    progress: number;
    completed?: boolean;
  };
}
