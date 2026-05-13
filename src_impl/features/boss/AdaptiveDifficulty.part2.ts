import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export function createAdaptiveDifficultyService(): AdaptiveDifficultyService {
  return new AdaptiveDifficultyService();
}

export function getAdaptiveDifficultyService(): AdaptiveDifficultyService {
  if (!adaptiveDifficultyService) {
    adaptiveDifficultyService = new AdaptiveDifficultyService();
  }
  return adaptiveDifficultyService;
}