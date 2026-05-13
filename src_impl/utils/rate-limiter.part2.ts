import { captureSilentFailure } from "./silent-failure";
import { MMKV } from "react-native-mmkv";
import { createDebugger } from "./debug";
import { eventBus } from "../events";


export const RateLimits = {
  // API requests
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000, key: 'api:general' },
  API_SENSITIVE: { maxRequests: 10, windowMs: 60 * 1000, key: 'api:sensitive' },

  // Feature specific
  SESSION_CREATE: { maxRequests: 5, windowMs: 60 * 60 * 1000, key: 'session:create' },
  CHALLENGE_SUBMIT: { maxRequests: 20, windowMs: 60 * 60 * 1000, key: 'challenge:submit' },
  DUEL_REQUEST: { maxRequests: 10, windowMs: 60 * 60 * 1000, key: 'duel:request' },

  // Social features
  FRIEND_REQUEST: { maxRequests: 20, windowMs: 24 * 60 * 60 * 1000, key: 'social:friend' },
  MESSAGE_SEND: { maxRequests: 100, windowMs: 60 * 60 * 1000, key: 'social:message' },

  // Content creation
  POST_CREATE: { maxRequests: 10, windowMs: 60 * 60 * 1000, key: 'feed:post' },
  COMMENT_CREATE: { maxRequests: 50, windowMs: 60 * 60 * 1000, key: 'feed:comment' },
} as const;

export async function checkRateLimit(
  userId: string,
  limitType: keyof typeof RateLimits
): Promise<RateLimitResult> {
  const config = RateLimits[limitType];
  const limiter = new SlidingWindowLimiter(config);
  return limiter.check(userId);
}

export async function requireRateLimit(
  userId: string,
  limitType: keyof typeof RateLimits
): Promise<void> {
  const result = await checkRateLimit(userId, limitType);

  if (!result.allowed) {
    throw new RateLimitError(`Rate limit exceeded. Retry after ${result.retryAfter}s`);
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const RateLimiter = {
  SlidingWindowLimiter,
  TokenBucketLimiter,
  checkRateLimit,
  requireRateLimit,
  RateLimits,
  RateLimitError,
};