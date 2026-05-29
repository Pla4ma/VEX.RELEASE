// ── Types ───────────────────────────────────────────────────────────────
export type {
  SurfaceId,
  PrimaryAction,
  ModeHomeSurface,
  QuickContractQuestion,
  ModeActiveIndicator,
} from "./schemas";

// Note: ModeQuickContract, ModeCompletionSurface, ModeRescueSurface,
// ModeWeeklyIntelligence are both types AND components.
// Re-export types from schemas with clarity:
import type {
  ModeQuickContract as ModeQuickContractType,
  ModeCompletionSurface as ModeCompletionSurfaceType,
  ModeRescueSurface as ModeRescueSurfaceType,
  ModeWeeklyIntelligence as ModeWeeklyIntelligenceType,
} from "./schemas";
export type {
  ModeQuickContractType,
  ModeCompletionSurfaceType,
  ModeRescueSurfaceType,
  ModeWeeklyIntelligenceType,
};

// ── Schemas ─────────────────────────────────────────────────────────────
export {
  SurfaceIdSchema,
  ModeHomeSurfaceSchema,
  ModeQuickContractSchema,
  ModeActiveIndicatorSchema,
  ModeCompletionSurfaceSchema,
  ModeRescueSurfaceSchema,
  ModeWeeklyIntelligenceSchema,
} from "./schemas";

// ── Copy ────────────────────────────────────────────────────────────────
export {
  HOME_COPY,
  QUICK_CONTRACT_COPY,
  ACTIVE_INDICATOR_COPY,
  COMPLETION_COPY,
  RESCUE_COPY,
  WEEKLY_INTELLIGENCE_COPY,
} from "./copy";

// ── Service ─────────────────────────────────────────────────────────────
export { deriveHomeSurface } from "./service";
export type { HomeContext } from "./service";
export { deriveQuickContract } from "./service";
export { deriveActiveIndicator } from "./service";
export { deriveRescueSurface } from "./service";
export { deriveCompletionSurface } from "./service-surface";
export type { CompletionContext } from "./service-surface";
export { deriveWeeklyIntelligence } from "./service-surface";
export type { WeeklyIntelligenceContext } from "./service-surface";

// ── Hooks ───────────────────────────────────────────────────────────────
export {
  useModeHomeSurface,
  useModeQuickContract,
  useModeActiveIndicator,
  useModeCompletion,
  useModeRescueSurface,
  useModeWeeklyIntelligence,
} from "./hooks";

// ── Components ──────────────────────────────────────────────────────────
export {
  ModeNativeHome,
  ModeQuickContract,
  ModeCompletionSurface,
  ModeRescueSurface,
  ModeActiveIndicatorBar,
  ModeWeeklyIntelligence,
} from "./components";
