import { z } from 'zod';
export interface SocialActivity {
  userId: string;
  activityType: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'SQUAD' | 'PUBLIC';
  data: Record<string, unknown>;
}

export const CompetitiveResultSchema = z.object({
  userId: z.string(),
  leaderboardId: z.string(),
  rank: z.number(),
  score: z.number(),
  previousRank: z.number().optional(),
  participants: z.number(),
});

export type CompetitiveResult = z.infer<typeof CompetitiveResultSchema>;

export interface SquadChallenge {
  squadId: string;
  challengeId: string;
  type: string;
  progress: number;
  target: number;
  contributors: Array<{ userId: string; contribution: number }>;
}
