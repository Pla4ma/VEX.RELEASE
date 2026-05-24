/**
 * Network Events
 */

export interface NetworkEventDefinitions {
  'network:online': { timestamp: number };
  'network:offline': { timestamp: number };
  'network:sync:complete': { synced: number; failed: number };
  'realtime:presence_update': { userId: string; status: string; timestamp?: number };
  'realtime:feed_update': { userId?: string; feedId?: string; itemId?: string; event?: string; data?: unknown; payload?: unknown; timestamp?: number };
  'realtime:squad_update': { squadId?: string; userId?: string; event?: string; data?: unknown; payload?: unknown; timestamp?: number };
}
