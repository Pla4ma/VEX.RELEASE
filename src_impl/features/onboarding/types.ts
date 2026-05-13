/**
 * Onboarding Types
 *
 * Domain types are inferred from schemas.ts (single source of truth).
 * This file only re-exports cross-feature types not owned by onboarding.
 *
 * @phase 4 - deduplicated: all Zod-inferred types removed, use schemas.ts
 */

// Re-export CompanionElement from companion feature
export type { CompanionElement } from '../companion/types';
