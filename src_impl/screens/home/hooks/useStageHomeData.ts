/**
 * Stage-specific Home data hooks — re-exports from isolated files.
 *
 * Each stage file has its own import graph:
 * - useNewUserHomeData: zero heavy queries, zero advanced imports
 * - useActivatingHomeData: zero heavy queries, zero advanced imports
 * - useEngagedHomeData: gated through FeatureAvailability
 * - usePowerUserHomeData: gated through FeatureAvailability
 */
export { useNewUserHomeData } from './useNewUserHomeData';
export { useActivatingHomeData } from './useActivatingHomeData';
export { useEngagedHomeData } from './useEngagedHomeData';
export { usePowerUserHomeData } from './usePowerUserHomeData';
