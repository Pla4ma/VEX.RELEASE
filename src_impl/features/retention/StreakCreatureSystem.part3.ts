import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export function createStreakCreatureService(): StreakCreatureService {
  return new StreakCreatureService();
}

export function getStreakCreatureService(): StreakCreatureService {
  if (!streakCreatureService) {
    streakCreatureService = new StreakCreatureService();
  }
  return streakCreatureService;
}