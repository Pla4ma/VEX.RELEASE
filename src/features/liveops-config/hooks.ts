/**
 * LiveOps Config — Hooks
 *
 * All TanStack Query + Zustand wiring for liveops-config goes here and ONLY here.
 * Re-exports from the feature index which contains useFeatureAccess and useDisclosureAnalytics.
 */

export { useFeatureAccess, useDisclosureAnalytics } from './index';
export type { FeatureAccessResult, FeatureAccessOptions } from './index';
