const processingKeys = new Set<string>();
const processedKeys = new Set<string>();

export function beginKeyProcessing(key: string): boolean {
  if (processingKeys.has(key) || processedKeys.has(key)) {
    return false;
  }
  processingKeys.add(key);
  return true;
}

export function markKeyProcessed(key: string): void {
  processingKeys.delete(key);
  processedKeys.add(key);
}

export function releaseKeyProcessing(key: string): void {
  processingKeys.delete(key);
}
