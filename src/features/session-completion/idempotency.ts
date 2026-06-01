import { z } from 'zod';

import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const MAX_IDEMPOTENCY_KEYS = 1000;
const STORAGE_KEY = 'session_completion_processed_keys_v1';
const storage = new MMKVStorageAdapter('session-completion-idempotency');

const PersistedKeysSchema = z
  .object({
    keys: z.array(z.string()),
    updatedAt: z.number(),
  })
  .strict();

const processedIdempotencyKeys = new Set<string>();
const processingIdempotencyKeys = new Set<string>();
let hasLoadedPersistedKeys = false;

export function isKeyProcessed(key: string): boolean {
  loadPersistedKeys();
  return processedIdempotencyKeys.has(key);
}

export function beginKeyProcessing(key: string): boolean {
  loadPersistedKeys();
  if (processedIdempotencyKeys.has(key) || processingIdempotencyKeys.has(key)) {
    return false;
  }
  processingIdempotencyKeys.add(key);
  return true;
}

export function markKeyProcessed(key: string): void {
  loadPersistedKeys();
  processingIdempotencyKeys.delete(key);
  processedIdempotencyKeys.add(key);
  if (processedIdempotencyKeys.size > MAX_IDEMPOTENCY_KEYS) {
    const toRemove = Math.floor(processedIdempotencyKeys.size * 0.5);
    let count = 0;
    for (const k of processedIdempotencyKeys) {
      if (count >= toRemove) {break;}
      processedIdempotencyKeys.delete(k);
      count += 1;
    }
  }
  persistKeys();
}

export function releaseKeyProcessing(key: string): void {
  processingIdempotencyKeys.delete(key);
}

export function resetCompletionIdempotencyForTests(): void {
  processedIdempotencyKeys.clear();
  processingIdempotencyKeys.clear();
  hasLoadedPersistedKeys = true;
  storage.removeItemSync(STORAGE_KEY);
}

function loadPersistedKeys(): void {
  if (hasLoadedPersistedKeys) {
    return;
  }
  hasLoadedPersistedKeys = true;
  const raw = storage.getItemSync(STORAGE_KEY);
  if (!raw) {
    return;
  }
  try {
    const parsed = PersistedKeysSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItemSync(STORAGE_KEY);
      return;
    }
    parsed.data.keys.forEach((key) => processedIdempotencyKeys.add(key));
  } catch (error: unknown) {
    storage.removeItemSync(STORAGE_KEY);
  }
}

function persistKeys(): void {
  storage.setItemSync(
    STORAGE_KEY,
    JSON.stringify({
      keys: Array.from(processedIdempotencyKeys),
      updatedAt: Date.now(),
    }),
  );
}
