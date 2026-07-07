/**
 * Babel Configuration for VEX App
 *
 * Configures the JavaScript compiler for React Native with:
 * - TypeScript support (via babel-preset-expo)
 * - Reanimated/Worklets plugin for animations (must be last)
 * - Production console-stripping via `transform-remove-console`
 *
 * Compatible with @babel/core 7.x and 8.x — both ship the same plugin API
 * shape used here. The CJS function form (`api.cache(true)`) is the lowest-
 * common-denominator loader and is supported by both major lines.
 */

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(process.env.NODE_ENV === 'production'
        ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
        : []),
      // Reanimated/worklets plugin MUST be the last item in the plugins list
      'react-native-reanimated/plugin',
    ],
  };
};
