/**
 * Storage Events
 */

export interface StorageEventDefinitions {
  'storage:quota:warning': { usage: number; limit: number };
  'storage:error': { operation: string; error: Error };
}
