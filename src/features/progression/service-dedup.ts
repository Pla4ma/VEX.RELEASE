import type { AddXpOperationResult } from "./service-enhanced-types";

const processedOperations = new Set<string>();
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
  processedOperations.add(key);
  if (processedOperations.size > 10000) {
    const toDelete = Array.from(processedOperations).slice(0, 1000);
    toDelete.forEach((operationKey) =>
      processedOperations.delete(operationKey),
    );
  }
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
