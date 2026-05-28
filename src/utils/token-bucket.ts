/**
 * Token Bucket Rate Limiter
 *
 * Implements a token bucket algorithm for rate limiting.
 */

import { captureSilentFailure } from "./silent-failure";
import { MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: "rate-limiter" });
  }
  return _storage;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
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
