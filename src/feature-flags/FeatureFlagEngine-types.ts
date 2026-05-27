export type FeatureFlagValue = boolean | string | number;

export const featureFlags = {
  isEnabled: (key: string) => getFeatureFlagEngine().isEnabled(key),
  getValue: <T extends FeatureFlagValue>(key: string, defaultValue: T) =>
    getFeatureFlagEngine().getValue(key, defaultValue),
  setUserContext: (context: UserContext) =>
    getFeatureFlagEngine().setUserContext(context),
  clearUserContext: () => getFeatureFlagEngine().clearUserContext(),
  override: (key: string, value: FeatureFlagValue) =>
    getFeatureFlagEngine().overrideFlag(key, value),
  sync: (flags: FeatureFlagConfig[]) =>
    getFeatureFlagEngine().syncRemoteFlags(flags),
  getAll: () => getFeatureFlagEngine().getAllFlags(),
};
