const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Metro configuration
 *
 * NOTE: We intentionally do NOT use getSentryExpoConfig() here.
 * That helper injects a Sentry bundle serializer which runs native
 * TurboModule calls (PlatformConstants) before the Expo Go runtime is
 * ready, crashing the app on load. Sentry is initialised lazily in
 * user-space code instead (config/sentry.ts).
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Ensure web platform is properly configured
config.resolver.platforms = ["ios", "android", "web"];

// Enable modern package exports (fixes ESM issues with Supabase)
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions
// Include .cjs and .mjs for packages like @supabase/supabase-js
if (!config.resolver.sourceExts) config.resolver.sourceExts = [];
if (!config.resolver.sourceExts.includes("cjs"))
  config.resolver.sourceExts.push("cjs");
if (!config.resolver.sourceExts.includes("mjs"))
  config.resolver.sourceExts.push("mjs");

// Add .cjs to assetExts
if (!config.resolver.assetExts) config.resolver.assetExts = [];
if (!config.resolver.assetExts.includes("cjs"))
  config.resolver.assetExts.push("cjs");

// ---------------------------------------------------------------------------
// Native module shims
//
// react-native-mmkv and react-native-purchases are NOT included in Expo Go.
// We use resolveRequest (not extraNodeModules) because extraNodeModules only
// fills in missing modules — it does NOT override packages that already exist
// in node_modules. resolveRequest intercepts the resolution before the normal
// node_modules lookup, so it reliably redirects to our in-memory shims.
// ---------------------------------------------------------------------------
const SHIMS = {
  "react-native-mmkv": path.resolve(__dirname, "shims/react-native-mmkv.js"),
  "react-native-purchases": path.resolve(
    __dirname,
    "shims/react-native-purchases.js",
  ),
  "@sentry/react-native": path.resolve(
    __dirname,
    "shims/sentry-react-native.js",
  ),
  "@sentry/react-native/metro": path.resolve(
    __dirname,
    "shims/sentry-react-native.js",
  ),
  "posthog-react-native": path.resolve(
    __dirname,
    "shims/posthog-react-native.js",
  ),
};

// IMPORTANT:
// We never want to override production/native modules globally.
// Shims are opt-in and intended only for Expo Go development runs.
const SHIMS_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS === "1" &&
  process.env.NODE_ENV !== "production";

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SHIMS_ENABLED && SHIMS[moduleName]) {
    return {
      filePath: SHIMS[moduleName],
      type: "sourceFile",
    };
  }
  // Fall back to the existing resolver (or Metro's default)
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
