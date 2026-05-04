/**
 * Babel Configuration for VEX App
 * 
 * Configures the JavaScript compiler for React Native with:
 - TypeScript support
 - Reanimated plugin for animations
 - Module resolver for path aliases
 - Development optimizations
 */

// Custom plugin to transform import.meta for Metro
const transformImportMeta = () => ({
  visitor: {
    MetaProperty(path) {
      // Transform import.meta to { url: 'file:///' }
      path.replaceWithSourceString("({ url: 'file:///' })");
    },
  },
});

const plugins = [
  // Handle import.meta (required for Supabase)
  transformImportMeta,
  [
    'module-resolver',
    {
      root: ['./src'],
      extensions: [
        '.ios.ts',
        '.android.ts',
        '.ts',
        '.ios.tsx',
        '.android.tsx',
        '.tsx',
        '.jsx',
        '.js',
        '.json',
      ],
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
  [
    '@babel/plugin-proposal-decorators',
    { legacy: true },
  ],
];

// Only add reanimated plugin for native platforms
if (process.env.EXPO_TARGET !== 'web' && process.env.PLATFORM !== 'web') {
  plugins.unshift('react-native-reanimated/plugin');
}

module.exports = {
  presets: ['babel-preset-expo'],
  plugins,
  env: {
    production: {
      plugins: [],
    },
  },
};
