import { getStorageManager } from '../persistence';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';
const debug = createDebugger('network');
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
interface RequestQueueConfig {
  maxRetries?: number;
  retryDelay?: number;
  storageKey?: string;
}
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
  async initialize(): Promise<void> {
    try {
      await this.storage.initialize();
      const persisted = await this.storage.getJSON<QueuedRequest[]>(
        this.config.storageKey,
      );
      if (persisted) {
        this.queue = persisted;
      }
    } catch (error) {
      debug.error('Failed to load request queue', error as Error);
    }
  }
  private async persist(): Promise<void> {
    try {
      await this.storage.setJSON(this.config.storageKey, this.queue);
    } catch (error) {
      debug.error('Failed to persist request queue', error as Error);
    }
  }
  async enqueue(
    request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>,
  ): Promise<string> {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    const insertIndex = this.queue.findIndex(
      (r) => r.priority < queuedRequest.priority,
    );
    if (insertIndex === -1) {
      this.queue.push(queuedRequest);
    } else {
      this.queue.splice(insertIndex, 0, queuedRequest);
    }
    await this.persist();
    return queuedRequest.id;
  }
  async dequeue(requestId: string): Promise<boolean> {
    const index = this.queue.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      await this.persist();
      return true;
    }
    return false;
  }
  peek(): Nullable<QueuedRequest> {
    return this.queue[0] ?? null;
  }
  getAll(): QueuedRequest[] {
    return [...this.queue];
  }
  get length(): number {
    return this.queue.length;
  }
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }
  async incrementRetry(requestId: string): Promise<boolean> {
    const request = this.queue.find((r) => r.id === requestId);
    if (request) {
      request.retryCount++;
      await this.persist();
      return request.retryCount <= this.config.maxRetries;
    }
    return false;
  }
  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }
  async process(
    handler: (request: QueuedRequest) => Promise<boolean>,
  ): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    while (!this.isEmpty) {
      const request = this.peek();
      if (!request) {
        break;
      }
      try {
        const success = await handler(request);
        if (success) {
          await this.dequeue(request.id);
        } else {
          const shouldRetry = await this.incrementRetry(request.id);
          if (!shouldRetry) {
            await this.dequeue(request.id);
          } else {
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
let requestQueueInstance: RequestQueue | null = null;
export function getRequestQueue(config?: RequestQueueConfig): RequestQueue {
  if (!requestQueueInstance) {
    requestQueueInstance = new RequestQueue(config);
  }
  return requestQueueInstance;
}
