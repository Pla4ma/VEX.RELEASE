/**
 * Leaderboard Events
 */

export interface LeaderboardEventDefinitions {
  'leaderboards:result': {
    userId: string;
    leaderboardId: string;
    rank: number;
    score: number;
    previousRank?: number;
    participants: number;
  };
  'leaderboards:score_update': {
    userId: string;
    leaderboardId: string;
    newScore?: number;
    score?: number;
  };
  'leaderboard:squad_score': {
    squadId: string;
    leaderboardType?: string;
    userId?: string;
    score?: number;
  };
}
