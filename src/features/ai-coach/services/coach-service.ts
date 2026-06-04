/**
 * Coach Service Interface & Singleton
 *
 * Provides the CoachService interface and default implementation
 * for compatibility with hooks expecting the service pattern.
 */

import type { CoachRecommendation } from './CoachRecommendationService';
import { fetchActiveRecommendations as fetchActiveRecommendationsRepository } from '../repository';
import type { SessionRecommendation } from '../schemas';
import {
  validateCoachInput,
  createFallbackInsight,
  type CoachInputContract,
} from '../input-contract';
// Note: input-contract.ts is a root feature module, not in services/

export async function fetchActiveRecommendations(
  userId: string,
): Promise<SessionRecommendation[]> {
  return fetchActiveRecommendationsRepository(userId);
}

export interface CoachService {
  createRecommendation: (
    userId: string,
    context: Record<string, unknown>,
  ) => Promise<CoachRecommendation | null>;
  generateMessage: (
    type: string,
    context: Record<string, unknown>,
  ) => Promise<string>;
  getSessionAdvice: (
    sessionData: Record<string, unknown>,
  ) => Promise<string | null>;
  // Phase 7: Input validation methods
  validateInput: (input: unknown) => CoachInputContract;
  canCoach: (input: Partial<CoachInputContract>) => {
    canCoach: boolean;
    reason: string;
  };
}

const coachServiceInstance: CoachService = {
  createRecommendation: async () => null,
  generateMessage: async () => '',
  getSessionAdvice: async () => null,
  validateInput: validateCoachInput,
  canCoach: createFallbackInsight,
};

export function getCoachService(): CoachService {
  return coachServiceInstance;
}
