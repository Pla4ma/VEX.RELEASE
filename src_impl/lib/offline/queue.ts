import { captureSilentFailure } from '../../utils/silent-failure';
import { v4 } from '../../utils/uuid';
/**
 * Offline Queue System
 * Manages pending operations when connection is lost
 */

import { z } from 'zod';
import { getConnectionState, subscribeToConnectionChanges, type ConnectionState } from '../repository/base';

// ============================================================================
// Queue Entry Schema
// ============================================================================
// Input type for enqueue - fields with defaults are optional
// ============================================================================
// In-Memory Queue (Production: Use MMKV/MMKV)
// ============================================================================

const queue: OfflineQueueEntry[] = [];
const processingSet = new Set<string>();
const listeners: Set<(queue: OfflineQueueEntry[]) => void> = new Set();

// ============================================================================
// Queue Operations
// ============================================================================
// ============================================================================
// Subscriptions
// ============================================================================

function notifyListeners(): void {
  const snapshot = [...queue];
  listeners.forEach(cb => cb(snapshot));
}

// ============================================================================
// Queue Processor
// ============================================================================
const processors: Map<string, QueueProcessor> = new Map();
// ============================================================================
// Auto-Processing
// ============================================================================

let autoProcessInterval: ReturnType<typeof setInterval> | null = null;
let isAutoProcessingEnabled = false;

async function processQueue(): Promise<void> {
  const entriesToProcess = queue.filter(e => !isProcessing(e.id));

  for (const entry of entriesToProcess) {
    try {
      await processEntry(entry);
    } catch (error) { captureSilentFailure(error, { feature: 'lib', operation: 'network-fallback', type: 'network' });
      // Entry will be updated with error, continue to next
    }
  }
}

// ============================================================================
// Conflict Resolution
// ============================================================================
// End of file
export * from "./queue.types";
export * from "./queue.part1";
export * from "./queue.part2";
