import { captureSilentFailure } from "./silent-failure";
import { MMKV } from "react-native-mmkv";
import { createDebugger } from "./debug";
import { eventBus } from "../events";
const debug = createDebugger("rate-limiter");
let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: "rate-limiter" });
  }
  return _storage;
}
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}
export interface UsageRecord {
  timestamp: number;
  count: number;
}
export class SlidingWindowLimiter {
  private config: RateLimitConfig;
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  async check(userId: string): Promise<RateLimitResult> {
    const key = `${this.config.key}:${userId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const records = this.getRecords(key);
    const validRecords = records.filter((r) => r.timestamp > windowStart);
    const currentCount = validRecords.reduce((sum, r) => sum + r.count, 0);
    if (currentCount >= this.config.maxRequests) {
      const oldestRecord = validRecords[0];
      const resetAt = oldestRecord
        ? oldestRecord.timestamp + this.config.windowMs
        : now;
      const retryAfter = Math.ceil((resetAt - now) / 1000);
      debug.warn("Rate limit exceeded", { key, userId, count: currentCount });
      eventBus.publish("analytics:track", {
        event: "rate_limit_exceeded",
        properties: { key, userId, limit: this.config.maxRequests },
      });
      return { allowed: false, remaining: 0, resetAt, retryAfter };
    }
    validRecords.push({ timestamp: now, count: 1 });
    this.saveRecords(key, validRecords);
    return {
      allowed: true,
      remaining: this.config.maxRequests - currentCount - 1,
      resetAt: now + this.config.windowMs,
      retryAfter: 0,
    };
  }
  getUsage(userId: string): { count: number; resetAt: number } {
    const key = `${this.config.key}:${userId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const records = this.getRecords(key);
    const validRecords = records.filter((r) => r.timestamp > windowStart);
    const count = validRecords.reduce((sum, r) => sum + r.count, 0);
    const oldestRecord = validRecords[0];
    const resetAt = oldestRecord
      ? oldestRecord.timestamp + this.config.windowMs
      : now;
    return { count, resetAt };
  }
  private getRecords(key: string): UsageRecord[] {
    try {
      const data = getStorage().getString(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      captureSilentFailure(error, {
        feature: "utils",
        operation: "safe-fallback",
        type: "data",
      });
      return [];
    }
  }
  private saveRecords(key: string, records: UsageRecord[]): void {
    getStorage().set(key, JSON.stringify(records.slice(-100)));
  }
}
export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  key: string;
}
interface BucketState {
  tokens: number;
  lastRefill: number;
}
export class TokenBucketLimiter {
  private config: TokenBucketConfig;
  constructor(config: TokenBucketConfig) {
    this.config = config;
  }
  async consume(userId: string, tokens: number = 1): Promise<RateLimitResult> {
    const key = `${this.config.key}:${userId}`;
    const now = Date.now();
    let bucket = this.getBucket(key);
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.config.refillRate;
    bucket.tokens = Math.min(this.config.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    if (bucket.tokens < tokens) {
      const tokensNeeded = tokens - bucket.tokens;
      const waitTimeMs = (tokensNeeded / this.config.refillRate) * 1000;
      this.saveBucket(key, bucket);
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + waitTimeMs,
        retryAfter: Math.ceil(waitTimeMs / 1000),
      };
    }
    bucket.tokens -= tokens;
    this.saveBucket(key, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt:
        now +
        ((this.config.capacity - bucket.tokens) / this.config.refillRate) *
          1000,
      retryAfter: 0,
    };
  }
  private getBucket(key: string): BucketState {
    try {
      const data = getStorage().getString(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      captureSilentFailure(error, {
        feature: "utils",
        operation: "safe-fallback",
        type: "data",
      });
    }
    return { tokens: this.config.capacity, lastRefill: Date.now() };
  }
  private saveBucket(key: string, bucket: BucketState): void {
    getStorage().set(key, JSON.stringify(bucket));
  }
}
export const RateLimits = {
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000, key: "api:general" },
  API_SENSITIVE: { maxRequests: 10, windowMs: 60 * 1000, key: "api:sensitive" },
  SESSION_CREATE: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    key: "session:create",
  },
  CHALLENGE_SUBMIT: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
    key: "challenge:submit",
  },
  DUEL_REQUEST: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    key: "duel:request",
  },
  FRIEND_REQUEST: {
    maxRequests: 20,
    windowMs: 24 * 60 * 60 * 1000,
    key: "social:friend",
  },
  MESSAGE_SEND: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000,
    key: "social:message",
  },
  POST_CREATE: { maxRequests: 10, windowMs: 60 * 60 * 1000, key: "feed:post" },
  COMMENT_CREATE: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000,
    key: "feed:comment",
  },
} as const;
export async function checkRateLimit(
  userId: string,
  limitType: keyof typeof RateLimits,
): Promise<RateLimitResult> {
  const config = RateLimits[limitType];
  const limiter = new SlidingWindowLimiter(config);
  return limiter.check(userId);
}
export async function requireRateLimit(
  userId: string,
  limitType: keyof typeof RateLimits,
): Promise<void> {
  const result = await checkRateLimit(userId, limitType);
  if (!result.allowed) {
    throw new RateLimitError(
      `Rate limit exceeded. Retry after ${result.retryAfter}s`,
    );
  }
}
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
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
export default RateLimiter;
