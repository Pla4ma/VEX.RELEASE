const processedIdempotencyKeys = new Set<string>();
const MAX_IDEMPOTENCY_KEYS = 1000;

export function isKeyProcessed(key: string): boolean {
  return processedIdempotencyKeys.has(key);
}

export function markKeyProcessed(key: string): void {
  processedIdempotencyKeys.add(key);
  if (processedIdempotencyKeys.size > MAX_IDEMPOTENCY_KEYS) {
    const toRemove = Math.floor(processedIdempotencyKeys.size * 0.5);
    let count = 0;
    for (const k of processedIdempotencyKeys) {
      if (count >= toRemove) break;
      processedIdempotencyKeys.delete(k);
      count += 1;
    }
  }
}
