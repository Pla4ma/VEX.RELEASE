import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export function getSessionNarrator(): SessionNarrator {
  if (!narrator) {
    narrator = new SessionNarrator();
  }
  return narrator;
}