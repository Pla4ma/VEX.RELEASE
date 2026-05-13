import { createDebugger } from "@/utils/debug";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";


export function getFeatureFlagEngine(): FeatureFlagEngine {
  if (!featureFlagEngine) {
    featureFlagEngine = new FeatureFlagEngine();
  }
  return featureFlagEngine;
}

export const featureFlags = {
  isEnabled: (key: string) => getFeatureFlagEngine().isEnabled(key),
  getValue: <T extends FeatureFlagValue>(key: string, defaultValue: T) => getFeatureFlagEngine().getValue(key, defaultValue),
  setUserContext: (context: UserContext) => getFeatureFlagEngine().setUserContext(context),
  clearUserContext: () => getFeatureFlagEngine().clearUserContext(),
  override: (key: string, value: FeatureFlagValue) => getFeatureFlagEngine().overrideFlag(key, value),
  sync: (flags: FeatureFlagConfig[]) => getFeatureFlagEngine().syncRemoteFlags(flags),
  getAll: () => getFeatureFlagEngine().getAllFlags(),
};