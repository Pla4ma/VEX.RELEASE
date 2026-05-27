/**
 * Request Deduplication
 *
 * Prevents duplicate concurrent requests.
 */

import { createDebugger } from "../utils/debug";

const debug = createDebugger("request-deduplicator");

export class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      debug.debug("Deduplicating request: %s", key);
      return this.pending.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}
