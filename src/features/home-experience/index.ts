export { HomeExperiencePrelude } from "./components/HomeExperiencePrelude";
export { useHomeExperienceModel } from "./hooks";
export { buildHomeExperienceModel, getHomeStage } from "./service";
export {
  decideHomeSurfaces,
  getPrimarySurface,
  getSpotlightSurface,
} from "./home-surface-decision";
export {
  enforceDay0SurfacePolicy,
  isDay0SurfacePolicyValid,
  DEFAULT_DAY0_POLICY,
} from "./day0-surface-policy";
export {
  HomeSurfaceDecisionSchema,
  HomeSurfaceKeySchema,
  HomeSurfaceMapSchema,
} from "./surface-decision-schemas";
export type { Day0PolicyLimits, Day0PolicyResult } from "./day0-surface-policy";
export type {
  HomeSurfaceDecision,
  HomeSurfaceKey,
  HomeSurfaceMap,
} from "./surface-decision-schemas";
export type {
  ExplicitMotivationStyle,
  HomeExperienceModel,
  HomeExperienceStage,
  HomeSection,
  HomeSpotlightSystem,
} from "./types";
