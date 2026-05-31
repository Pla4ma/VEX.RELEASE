import * as Sentry from '@sentry/react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { COACH_QUERY_KEYS } from '../constants';
import * as repository from '../repository';
import type { RecommendationType, SessionRecommendation } from '../schemas';

type CreateRecommendationInput = {
  userId: string;
  type: RecommendationType;
  context: Record<string, unknown>;
};

type UpdateRecommendationStatusInput = {
  recommendationId: string;
  status: SessionRecommendation['status'];
  userId?: string;
};

function createUuid(): string {
  const random = Math.random().toString(16).slice(2).padEnd(12, '0');
  const now = Date.now().toString(16).padStart(12, '0');
  return `${now.slice(0, 8)}-${now.slice(8, 12)}-4000-8000-${random.slice(0, 12)}`;
}

function buildRecommendation(
  input: CreateRecommendationInput,
): SessionRecommendation {
  const now = Date.now();
  return {
    id: createUuid(),
    userId: input.userId,
    recommendationType: input.type,
    title:
      input.type === 'STREAK_PROTECTION'
        ? 'Protect your streak'
        : 'Start a focused session',
    description:
      'Your coach picked the next session that best fits your current momentum.',
    priority: input.type === 'STREAK_PROTECTION' ? 9 : 6,
    reason:
      input.type === 'STREAK_PROTECTION'
        ? 'Your streak is the strongest next action.'
        : 'This is a good time window to focus.',
    metadata: input.context,
    suggestedDuration: 15 * 60,
    suggestedDifficulty: input.type === 'STREAK_PROTECTION' ? 'NORMAL' : 'EASY',
    reasoning: 'Generated from home return context.',
    confidence: 0.75,
    basedOn: [],
    expiresAt: now + 6 * 60 * 60 * 1000,
    createdAt: now,
    acceptedAt: null,
    dismissedAt: null,
    status: 'ACTIVE',
  };
}

export function useCreateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecommendationInput) =>
      repository.createRecommendation(buildRecommendation(input)),
    onSuccess: (recommendation) => {
      queryClient.invalidateQueries({
        queryKey: COACH_QUERY_KEYS.recommendations(recommendation.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'ai-coach', operation: 'create-recommendation' },
      });
    },
  });
}

export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRecommendationStatusInput) =>
      repository.updateRecommendationStatus(
        input.recommendationId,
        input.status,
        Date.now(),
      ),
    onSuccess: (recommendation) => {
      queryClient.invalidateQueries({
        queryKey: COACH_QUERY_KEYS.recommendations(recommendation.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: {
          feature: 'ai-coach',
          operation: 'update-recommendation-status',
        },
      });
    },
  });
}

export type { SessionRecommendation };
