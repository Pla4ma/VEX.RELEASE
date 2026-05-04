const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

/**
 * Metro configuration
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getSentryExpoConfig(__dirname);

// Ensure web platform is properly configured
config.resolver.platforms = ['ios', 'android', 'web'];

// Enable modern package exports (fixes ESM issues with Supabase)
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions for web
// Include .cjs and .mjs for packages like @supabase/supabase-js
config.resolver.sourceExts = [
  'web.tsx', 'web.ts', 'web.jsx', 'web.js',
  'cjs', 'mjs',
  'tsx', 'ts', 'jsx', 'js', 'json'
];

// Add .cjs to assetExts for module resolution
config.resolver.assetExts = config.resolver.assetExts || [];
config.resolver.assetExts.push('cjs');

// Block native-only modules from web bundle on web
if (process.env.EXPO_TARGET === 'web' || process.env.PLATFORM === 'web') {
  config.resolver.blockList = [
    /react-native-reanimated[\/\\].*\.js$/,
    /react-native-worklets[\/\\].*\.js$/,
    /react-native-mmkv[\/\\].*\.js$/,
  ];
}

module.exports = config;