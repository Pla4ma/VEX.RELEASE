/**
 * Debounced MMKV writes.
 *
 * Batches rapid consecutive setItem/removeItem/clear calls into a single
 * write after `delay` ms of inactivity. Prevents disk I/O storms from
 * high-frequency state updates (e.g., active session timer).
 */

type WriteOp = { key: string; value: string | null; remove: boolean };

const pendingWrites = new Map<string, WriteOp>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let onFlush: (key: string, op: WriteOp) => void;
let delayMs: number;

export function configureDebouncedWrites(
  handler: (key: string, op: WriteOp) => void,
  opts: { delay?: number } = {},
): void {
  onFlush = handler;
  delayMs = opts.delay ?? 100;
}

function scheduleFlush(): void {
  if (flushTimer) {clearTimeout(flushTimer);}
  flushTimer = setTimeout(flush, delayMs);
}

function flush(): void {
  if (!onFlush) {return;}
  for (const [key, op] of pendingWrites) {
    onFlush(key, op);
  }
  pendingWrites.clear();
  flushTimer = null;
}

export function debouncedWrite(
  key: string,
  value: string | null,
  remove = false,
): void {
  pendingWrites.set(key, { key, value, remove });
  scheduleFlush();
}

export function flushPendingWrites(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  flush();
}

export function hasPendingWrites(): boolean {
  return pendingWrites.size > 0;
}
