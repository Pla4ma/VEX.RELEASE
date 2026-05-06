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
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@theme': './src_impl/theme',
            '@components': './src_impl/components',
            '@navigation': './src_impl/navigation',
            '@store': './src_impl/store',
            '@utils': './src_impl/utils',
            '@types': './src_impl/types',
            '@constants': './src_impl/constants',
            '@overlays': './src_impl/overlays',
            '@animation': './src_impl/animation',
            '@icons': './src_impl/icons',
            '@a11y': './src_impl/a11y',
            '@events': './src_impl/events',
            '@analytics': './src_impl/analytics',
            '@featureFlags': './src_impl/featureFlags',
            '@settings': './src_impl/settings',
            '@persistence': './src_impl/persistence',
            '@network': './src_impl/network',
            '@errors': './src_impl/errors',
            '@states': './src_impl/states',
            '@shell': './src_impl/shell',
            '@app': './src_impl/app',
            '@screens': './src_impl/screens',
            '@validation': './src_impl/validation',
          },
        },
      ],
    ],
  };
};
