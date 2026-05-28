import type { FeatureFlagConfig } from "./featureFlagTypes";
import { FeatureFlagService } from "./FeatureFlagService";

let featureFlagServiceInstance: FeatureFlagService | null = null;

export function getFeatureFlagService(
  config?: FeatureFlagConfig,
): FeatureFlagService {
  if (!featureFlagServiceInstance) {
    featureFlagServiceInstance = new FeatureFlagService(config);
  }
  return featureFlagServiceInstance;
}
