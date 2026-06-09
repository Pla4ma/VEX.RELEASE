/**
 * Session Completion Repository
 *
 * Persists completion ledgers to MMKV for crash/restart safety.
 * Formerly an in-memory Map — now survives app backgrounding,
 * OS kills, and restarts. (P0-1 fix)
 *
 * Cleanup: call cleanupStaleLedgers() after confirmed sync
 * or on app startup to prevent accumulation (default: 7 days).
 */

import * as Sentry from '@sentry/react-native';

import { MMKV } from 'react-native-mmkv';
import { captureSilentFailure } from '../../utils/silent-failure';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from './schemas';

// Dedicated MMKV instance for completion ledgers
const ledgerMMKV = new MMKV({ id: 'session-completion-ledgers' });

const LEDGER_KEY_PREFIX = 'ledger_ik:';

/**
 * Custom error for repository operations — preserves cause chain.
 */
export class SessionCompletionRepositoryError extends Error {
  public readonly cause: unknown;

  constructor(operation: string, cause: unknown) {
    super(
      `SessionCompletionRepository[${operation}]: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'SessionCompletionRepositoryError';
    this.cause = cause;
  }
}

function storageKey(idempotencyKey: string): string {
  return `${LEDGER_KEY_PREFIX}${idempotencyKey}`;
}

/**
 * Persist a completion ledger to MMKV.
 * Validates through Zod before writing.
 */
export async function createCompletionLedger(
  ledger: CompletionLedger,
): Promise<CompletionLedger> {
  try {
    const parsed = CompletionLedgerSchema.parse(ledger);
    const key = storageKey(parsed.idempotencyKey);
    ledgerMMKV.set(key, JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'session-completion',
      operation: 'create-ledger',
      type: 'data',
    });
    throw new SessionCompletionRepositoryError('create', error);
  }
}

/**
 * Look up a ledger by its idempotency key.
 * Returns null if not found or if stored data is corrupt.
 */
export async function getCompletionLedgerByIdempotencyKey(
  idempotencyKey: string,
): Promise<CompletionLedger | null> {
  try {
    const raw = ledgerMMKV.getString(storageKey(idempotencyKey));
    if (!raw) {return null;}
    return CompletionLedgerSchema.parse(JSON.parse(raw));
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'session-completion',
      operation: 'lookup-ledger',
      type: 'data',
    });
    return null;
  }
}

/**
 * Update the sync status of a ledger by ledgerId.
 * Scans all ledger keys in MMKV for a match.
 */
export async function updateCompletionSyncStatus(
  ledgerId: string,
  offlineSyncStatus: CompletionSyncStatus,
): Promise<void> {
  try {
    const allKeys = ledgerMMKV.getAllKeys();
    const ledgerKeys = allKeys.filter((k) =>
      k.startsWith(LEDGER_KEY_PREFIX),
    );

    for (const key of ledgerKeys) {
      const raw = ledgerMMKV.getString(key);
      if (!raw) {continue;}
      try {
        const ledger = CompletionLedgerSchema.parse(JSON.parse(raw));
        if (ledger.ledgerId === ledgerId) {
          const updated: CompletionLedger = {
            ...ledger,
            offlineSyncStatus,
          };
          ledgerMMKV.set(key, JSON.stringify(updated));
          return;
        }
      } catch {
        // Skip corrupt entries
      }
    }

    Sentry.addBreadcrumb({
      category: 'session-completion',
      message: `Ledger ${ledgerId} not found for sync status update`,
      level: 'warning',
    });
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'session-completion',
      operation: 'update-sync-status',
      type: 'data',
    });
  }
}

/**
 * Remove ledgers older than maxAgeMs to prevent unbounded growth.
 * Default: 7 days. Call after confirmed sync or on app startup.
 * Returns the number of entries removed.
 */
export function cleanupStaleLedgers(
  maxAgeMs: number = 7 * 86_400_000,
): number {
  const cutoff = Date.now() - maxAgeMs;
  let removed = 0;

  try {
    const allKeys = ledgerMMKV.getAllKeys();
    const ledgerKeys = allKeys.filter((k) =>
      k.startsWith(LEDGER_KEY_PREFIX),
    );

    for (const key of ledgerKeys) {
      const raw = ledgerMMKV.getString(key);
      if (!raw) {continue;}
      try {
        const ledger = CompletionLedgerSchema.parse(JSON.parse(raw));
        if (ledger.createdAt < cutoff) {
          ledgerMMKV.delete(key);
          removed += 1;
        }
      } catch {
        // Remove corrupt entries too
        ledgerMMKV.delete(key);
        removed += 1;
      }
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'session-completion',
      operation: 'cleanup-stale',
      type: 'data',
    });
  }

  return removed;
}
