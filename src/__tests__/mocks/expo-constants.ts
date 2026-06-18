/**
 * Jest mock for expo-constants
 *
 * Provides static config values that tests expect.
 */
const Constants = {
  manifest: {
    name: 'vex-app',
    slug: 'vex-app',
    version: '1.0.0',
    sdkVersion: '56.0.0',
  },
  executionEnvironment: 'storeClient',
  get appOwnership() {
    return 'store';
  },
  useConfigValues: true,
};

export default Constants;
