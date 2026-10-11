const { getDefaultConfig } = require('expo/metro-config');
const SHIMS = require('./config/metro/shims');
const { shouldShim } = require('./config/metro/shim-policy');

const config = getDefaultConfig(__dirname);
config.resolver.platforms = ['ios', 'android', 'web'];
config.resolver.unstable_enablePackageExports = true;
config.resolver.assetExts ??= [];
if (!config.resolver.assetExts.includes('riv')) config.resolver.assetExts.push('riv');

const SHIM_PACKAGES = Object.keys(SHIMS);
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. Exact package shim
  if (shouldShim(moduleName, platform, context.dev, process.env) && SHIMS[moduleName]) {
    const shimPath = SHIMS[moduleName];
    return {
      filePath: shimPath,
      type: 'sourceFile',
    };
  }

  // 2. Subpath match: e.g. 'expo-blur/src/BlurView' → 'expo-blur'
  const shimmedPackage = SHIM_PACKAGES.find(
    (pkg) => moduleName.startsWith(`${pkg}/`),
  );
  if (shimmedPackage && shouldShim(shimmedPackage, platform, context.dev, process.env)) {
    const shimPath = SHIMS[shimmedPackage];
    if (shimPath) {
      return {
        filePath: shimPath,
        type: 'sourceFile',
      };
    }
  }

  // 3. Supabase CJS resolution — force @supabase/* packages to their CJS
  //    entry via require.resolve. Metro's unstable_enablePackageExports
  //    resolves the "react-native" condition to dist/index.cjs, but the
  //    Rolldown-bundled CJS wrapper (__commonJSMin pattern) breaks when
  //    Metro's Babel transform processes the .cjs file. Using require.resolve
  //    gives us the same .cjs path but ensures Metro treats it as a source
  //    file with the correct CJS semantics.
  //    Only intercept top-level packages (e.g. @supabase/auth-js), NOT
  if (moduleName.startsWith('@supabase/') && moduleName.split('/').length === 2) {
    try {
      const resolved = require.resolve(moduleName);
      return {
        filePath: resolved,
        type: 'sourceFile',
      };
    } catch (_e) { /* fall through */ }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};


module.exports = config;
