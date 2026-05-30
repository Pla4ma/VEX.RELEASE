import type { AddXpOperationResult } from "./types";
import { getMMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";

const DEDUP_MMKV_KEY = "prog:dedup:keys";
const MAX_DEDUP_ENTRIES = 500;
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000;

interface DedupEntry {
  key: string;
  ts: number;
}

const mmkv = getMMKVStorageAdapter();

async function loadPersistedKeys(): Promise<Map<string, number>> {
  try {
    const raw = await mmkv.getItem(DEDUP_MMKV_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as DedupEntry[];
    const cutoff = Date.now() - DEDUP_TTL_MS;
    const valid = parsed.filter((e) => e.ts > cutoff);
    return new Map(valid.map((e) => [e.key, e.ts]));
  } catch {
    return new Map();
  }
}

function savePersistedKeys(entries: DedupEntry[]): void {
  const trimmed = entries.slice(-MAX_DEDUP_ENTRIES);
  void mmkv.setItem(DEDUP_MMKV_KEY, JSON.stringify(trimmed));
}

let processedOperations = new Map<string, number>();
let loadedPromise: Promise<void> | null = null;

function ensureLoaded(): void {
  if (loadedPromise) return;
  loadedPromise = loadPersistedKeys().then((loaded) => {
    processedOperations = loaded;
  });
}
ensureLoaded();

const pendingOperations = new Map<string, Promise<AddXpOperationResult>>();

export function generateIdempotencyKey(
  userId: string,
  operation: string,
  context?: string,
): string {
  return `prog:${userId}:${operation}:${context || Date.now()}`;
}

export function isDuplicateOperation(key: string): boolean {
  return processedOperations.has(key);
}

export function markOperationProcessed(key: string): void {
  const now = Date.now();
  processedOperations.set(key, now);
  if (processedOperations.size > MAX_DEDUP_ENTRIES) {
    const sorted = [...processedOperations.entries()].sort(
      ([, a], [, b]) => a - b,
    );
    processedOperations = new Map(sorted.slice(-MAX_DEDUP_ENTRIES));
  }
  const cutoff = now - DEDUP_TTL_MS;
  const active: DedupEntry[] = [];
  processedOperations.forEach((ts, k) => {
    if (ts > cutoff) {
      active.push({ key: k, ts });
    }
  });
  savePersistedKeys(active);
}

export async function deduplicateConcurrent(
  key: string,
  operation: () => Promise<AddXpOperationResult>,
): Promise<AddXpOperationResult> {
  const existing = pendingOperations.get(key);
  if (existing) {
    return existing;
  }
  const promise = operation().finally(() => {
    pendingOperations.delete(key);
  });
  pendingOperations.set(key, promise);
  return promise;
}
