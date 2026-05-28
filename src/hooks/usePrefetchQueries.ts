/**
 * usePrefetchQueries — Barrel re-export
 *
 * Split into prefetch-query-keys.ts, prefetcher.ts, and prefetch-hooks.ts
 */

export { usePrefetchQueries } from "./prefetch-hooks";
export { createPrefetcher, canPrefetchFeature, isCoreQueryKey } from "./prefetcher";
export {
  QueryKeys,
  type PrefetchPolicy,
  type PrefetchOptions,
  type PrefetchQueryClient,
  type PrefetchQueriesReturn,
} from "./prefetch-query-keys";
export { usePrefetchQueries as default } from "./prefetch-hooks";
