export interface SocialActivity {
  userId: string;
  activityType: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'SQUAD' | 'PUBLIC';
  data: Record<string, unknown>;
}

export interface CompetitiveResult {
  userId: string;
  leaderboardId: string;
  rank: number;
  score: number;
  previousRank?: number;
  participants: number;
}

export interface SquadChallenge {
  squadId: string;
  challengeId: string;
  type: string;
  progress: number;
  target: number;
  contributors: Array<{ userId: string; contribution: number }>;
}
