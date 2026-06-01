/**
 * Babel Configuration for VEX App
 * 
 * Configures the JavaScript compiler for React Native with:
 - TypeScript support
 - Reanimated plugin for animations
 - Module resolver for path aliases
 - Development optimizations
 */

module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(process.env.NODE_ENV === 'production' ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@theme': './src/theme',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types',
            '@constants': './src/constants',
            '@overlays': './src/overlays',
            '@animation': './src/animation',
            '@icons': './src/icons',
            '@a11y': './src/a11y',
            '@events': './src/events',
            '@analytics': './src/analytics',
            '@featureFlags': './src/featureFlags',
            '@settings': './src/settings',
            '@persistence': './src/persistence',
            '@network': './src/network',
            '@errors': './src/errors',
            '@states': './src/states',
            '@shell': './src/shell',
            '@app': './src/app',
            '@screens': './src/screens',
            '@validation': './src/validation',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
