/**
 * Session Completion Offline Sync Service
 * 
 * Ensures session completion data is never lost by providing robust
 * offline-first synchronization with multiple fallback mechanisms.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import { enqueue, type OfflineQueueEntry, type OfflineQueueEntryInput, registerProcessor } from '../../lib/offline/queue';
import { getNetInfoAdapter, type NetworkState } from '../../network/NetInfoAdapter';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from './schemas';
import {
  createCompletionLedger,
  updateCompletionSyncStatus,
  SessionCompletionRepositoryError,
} from './repository';

const debug = createDebugger('session-completion:offline-sync');

// ============================================================================
// Enhanced Offline Queue Entry Types
// ============================================================================
// ============================================================================
// Local Storage Fallback (Production: Use MMKV)
// ============================================================================

const LOCAL_STORAGE_KEY = 'vex_session_completion_fallback';
const MAX_FALLBACK_ENTRIES = 100;

interface FallbackStorage {
  entries: SessionCompletionOfflineEntry[];
  lastSyncAt: number;
}

class FallbackStorageManager {
  private storage: FallbackStorage = {
    entries: [],
    lastSyncAt: 0,
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      // In production, use MMKV for better performance
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.storage = {
          entries: parsed.entries || [],
          lastSyncAt: parsed.lastSyncAt || 0,
        };
      }
    } catch (error) {
      debug.warn('Failed to load fallback storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.storage));
    } catch (error) {
      debug.warn('Failed to save fallback storage:', error);
    }
  }

  addEntry(entry: SessionCompletionOfflineEntry): void {
    // Remove old entries if we're at capacity
    if (this.storage.entries.length >= MAX_FALLBACK_ENTRIES) {
      this.storage.entries = this.storage.entries.slice(-MAX_FALLBACK_ENTRIES + 1);
    }

    // Check for duplicates by session ID
    const existingIndex = this.storage.entries.findIndex(
      e => e.payload.sessionId === entry.payload.sessionId
    );

    if (existingIndex >= 0) {
      // Update existing entry
      this.storage.entries[existingIndex] = entry;
    } else {
      // Add new entry
      this.storage.entries.push(entry);
    }

    this.saveToStorage();
    debug.info('Added entry to fallback storage: %s', entry.payload.sessionId);
  }

  getEntries(): SessionCompletionOfflineEntry[] {
    return [...this.storage.entries];
  }

  removeEntry(sessionId: string): boolean {
    const index = this.storage.entries.findIndex(
      e => e.payload.sessionId === sessionId
    );

    if (index >= 0) {
      this.storage.entries.splice(index, 1);
      this.saveToStorage();
      debug.info('Removed entry from fallback storage: %s', sessionId);
      return true;
    }

    return false;
  }

  clear(): void {
    this.storage.entries = [];
    this.storage.lastSyncAt = 0;
    this.saveToStorage();
    debug.info('Cleared fallback storage');
  }

  updateLastSyncAt(): void {
    this.storage.lastSyncAt = Date.now();
    this.saveToStorage();
  }
}

const fallbackStorage = new FallbackStorageManager();

// ============================================================================
// Session Completion Offline Sync Service
// ============================================================================
// ============================================================================
// Singleton Instance
// ============================================================================
// Alias for backward compatibility
// ============================================================================
// React Hook
// ============================================================================
export * from "./offline-sync-service.types";
export * from "./offline-sync-service.types";
export * from "./offline-sync-service.part1";
export * from "./offline-sync-service.part2";
