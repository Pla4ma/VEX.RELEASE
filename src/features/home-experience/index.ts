export { HomeExperiencePrelude } from './components/HomeExperiencePrelude';
export { useHomeExperienceModel } from './hooks';
export { buildHomeExperienceModel, getHomeStage } from './service';
export { decideHomeSurfaces, getPrimarySurface, getSpotlightSurface } from './home-surface-decision';
export { HomeSurfaceDecisionSchema, HomeSurfaceKeySchema, HomeSurfaceMapSchema } from './surface-decision-schemas';
export type {
  HomeSurfaceDecision,
  HomeSurfaceKey,
  HomeSurfaceMap,
} from './surface-decision-schemas';
export type {
  ExplicitMotivationStyle,
  HomeExperienceModel,
  HomeExperienceStage,
  HomeSection,
  HomeSpotlightSystem,
} from './types';
