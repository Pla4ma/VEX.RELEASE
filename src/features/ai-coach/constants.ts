/**
 * AI Coach Constants
 */

export const COACH_QUERY_KEYS = {
  all: ['coach'] as const,
  personas: () => [...COACH_QUERY_KEYS.all, 'personas'] as const,
  state: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'state', userId] as const,
  profile: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'profile', userId] as const,
  messages: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'messages', userId] as const,
  history: (userId: string, limit?: number) =>
    [...COACH_QUERY_KEYS.all, 'history', userId, limit] as const,
  recommendations: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'recommendations', userId] as const,
  comeback: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'comeback', userId] as const,
  interventions: (userId: string) =>
    [...COACH_QUERY_KEYS.all, 'interventions', userId] as const,
};

export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  retryCondition: (error: Error) => {
    if (error.message.includes('404') || error.message.includes('403')) {
      return false;
    }
    return true;
  },
};
