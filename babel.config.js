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
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
