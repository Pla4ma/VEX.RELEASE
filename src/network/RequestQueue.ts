/**
 * Request Queue
 *
 * Queue for offline request persistence and retry.
 */

import { getStorageManager } from '../persistence';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('network');

/**
 * Queued request
 */
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retryCount: number;
  priority: number;
}

/**
 * Request queue configuration
 */
interface RequestQueueConfig {
  maxRetries?: number;
  retryDelay?: number;
  storageKey?: string;
}

/**
 * Request queue for offline support
 */
export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private config: Required<RequestQueueConfig>;
  private storage = getStorageManager();
  private isProcessing = false;

  constructor(config: RequestQueueConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      storageKey: 'request-queue',
      ...config,
    };
  }

  /**
   * Initialize and load persisted queue
   */
  async initialize(): Promise<void> {
    try {
      await this.storage.initialize();
      const persisted = await this.storage.getJSON<QueuedRequest[]>(this.config.storageKey);
      if (persisted) {
        this.queue = persisted;
      }
    } catch (error) {
      debug.error('Failed to load request queue', error as Error);
    }
  }

  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    try {
      await this.storage.setJSON(this.config.storageKey, this.queue);
    } catch (error) {
      debug.error('Failed to persist request queue', error as Error);
    }
  }

  /**
   * Add request to queue
   */
  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex((r) => r.priority < queuedRequest.priority);
    if (insertIndex === -1) {
      this.queue.push(queuedRequest);
    } else {
      this.queue.splice(insertIndex, 0, queuedRequest);
    }

    await this.persist();
    return queuedRequest.id;
  }

  /**
   * Remove request from queue
   */
  async dequeue(requestId: string): Promise<boolean> {
    const index = this.queue.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      await this.persist();
      return true;
    }
    return false;
  }

  /**
   * Get next request
   */
  peek(): Nullable<QueuedRequest> {
    return this.queue[0] ?? null;
  }

  /**
   * Get all queued requests
   */
  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Increment retry count
   */
  async incrementRetry(requestId: string): Promise<boolean> {
    const request = this.queue.find((r) => r.id === requestId);
    if (request) {
      request.retryCount++;
      await this.persist();
      return request.retryCount <= this.config.maxRetries;
    }
    return false;
  }

  /**
   * Clear all requests
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }

  /**
   * Process queue with provided handler
   */
  async process(handler: (request: QueuedRequest) => Promise<boolean>): Promise<void> {
    if (this.isProcessing) {return;}
    this.isProcessing = true;

    while (!this.isEmpty) {
      const request = this.peek();
      if (!request) {break;}

      try {
        const success = await handler(request);
        if (success) {
          await this.dequeue(request.id);
        } else {
          const shouldRetry = await this.incrementRetry(request.id);
          if (!shouldRetry) {
            await this.dequeue(request.id);
          } else {
            // Move to end of queue for later retry
            await this.dequeue(request.id);
            await this.enqueue({
              url: request.url,
              method: request.method,
              headers: request.headers,
              body: request.body,
              priority: request.priority,
            });
          }
        }
      } catch (error) {
        debug.error('Error processing request:', error as Error);
        break;
      }
    }

    this.isProcessing = false;
  }
}

/**
 * Singleton instance
 */
let requestQueueInstance: RequestQueue | null = null;

export function getRequestQueue(config?: RequestQueueConfig): RequestQueue {
  if (!requestQueueInstance) {
    requestQueueInstance = new RequestQueue(config);
  }
  return requestQueueInstance;
}
