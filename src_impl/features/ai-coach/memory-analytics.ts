import * as Sentry from '@sentry/react-native';
import type { CoachMemory } from './memory-schemas';

export function trackMemoryCreated(memory: CoachMemory): void {
  Sentry.addBreadcrumb({
    category: 'coach.memory',
    message: `Coach memory created: ${memory.type}`,
    level: 'info',
    data: {
      userId: hashUserId(memory.userId),
      memoryId: memory.id,
      type: memory.type,
      referencedCount: memory.referencedCount,
    },
  });
}

export function trackMemoryError(
  operation: string,
  error: unknown,
  userId?: string,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation },
    extra: { userId: userId ? hashUserId(userId) : undefined },
  });
}

function hashUserId(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash << 5) - hash + userId.charCodeAt(index);
    hash &= hash;
  }
  return `user_${Math.abs(hash).toString(16)}`;
}
