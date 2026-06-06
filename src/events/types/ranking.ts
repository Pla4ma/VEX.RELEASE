/**
 * Ranking Events
 */

export interface RankingEventDefinitions {
  'ranking:updated': {
    userId: string;
    category: string;
    newRank: number;
    oldRank: number;
  };
  'ranking:tier_achieved': {
    userId: string;
    tierName: string;
    previousTier?: string;
  };
  'ranking:leaderboard_updated': {
    leaderboardId: string;
    entriesUpdated: number;
  };
  'ranking:season_ended': {
    seasonId: string;
    userId: string;
    finalRank: number;
  };
  'leaderboards:result': Record<string, unknown>;
}
