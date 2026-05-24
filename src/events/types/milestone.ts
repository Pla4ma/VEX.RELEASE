/**
 * Milestone Events
 */

export interface MilestoneEventDefinitions {
  'milestones:spending_reached': {
    userId: string;
    milestoneId: string;
    milestone?: string;
    totalSpent: number;
    currency: string;
  };
}
