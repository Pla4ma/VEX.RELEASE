/**
 * Challenge bank template type definitions.
 */

export interface ChallengeBankTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  target: number;
  timeLimit: number;
  rewardType: string;
  rewardAmount: number;
  tags: string[];
  seasonal: boolean;
  seasonWindow?: { startMonth: number; endMonth: number };
}
