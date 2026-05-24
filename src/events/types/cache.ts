/**
 * Cache Events
 */

export interface CacheEventDefinitions {
  'cache:clear': { reason?: string };
  'cache:invalidate': { key: string };
}
