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

config.resolver.unstable_enablePackageExports = true;

// Add .riv to assetExts (audio files for VEX)
if (!config.resolver.assetExts) config.resolver.assetExts = [];
if (!config.resolver.assetExts.includes("riv"))
  config.resolver.assetExts.push("riv");

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
  // vaul is a React DOM drawer imported unconditionally by @expo/ui.
  // Its transitive deps (@radix-ui/react-dialog, react-remove-scroll,
  // aria-hidden, etc.) access browser globals at module init time and
  // must never be bundled into the React Native runtime.
  "vaul": path.resolve(__dirname, "shims/vaul.js"),
  // expo-glass-effect calls requireNativeViewManager('ExpoGlassEffect')
  // at module evaluation time (GlassView.ios.js top-level const). This
  // fires before the runtime bridge is ready, crashing with:
  //   ERROR  [runtime not ready]: TypeError: undefined is not a function
  // Same fix as @sentry/react-native — shim for dev, real module in production.
  "expo-glass-effect": path.resolve(__dirname, "shims/expo-glass-effect.js"),
  // expo-blur calls requireNativeViewManager('ExpoBlur') at module level
  // in NativeBlurModule.js — same early-native-access pattern.
  "expo-blur": path.resolve(__dirname, "shims/expo-blur.js"),
  // expo-linear-gradient calls requireNativeViewManager('ExpoLinearGradient')
  // at module evaluation time. In Expo Go / remote-debug startup this can run
  // before the native runtime is ready and throw:
  //   ERROR  [runtime not ready]: TypeError: undefined is not a function
  "expo-linear-gradient": path.resolve(
    __dirname,
    "shims/expo-linear-gradient.js",
  ),
  // expo-image creates ExpoImage native view at module evaluation time.
  "expo-image": path.resolve(__dirname, "shims/expo-image.js"),
  // expo-apple-authentication creates ExpoAppleAuthenticationButton native view
  // at module evaluation time even when only auth helpers are imported.
  "expo-apple-authentication": path.resolve(
    __dirname,
    "shims/expo-apple-authentication.js",
  ),
  // expo-font calls requireNativeModule('ExpoFontLoader') at module evaluation
  // time (ExpoFontLoader.js top-level const). Pulled in transitively by `expo`
  // which is imported at the top of App.tsx. Fires before the bridge is ready.
  "expo-font": path.resolve(__dirname, "shims/expo-font.js"),
  // expo-asset calls requireNativeModule('ExpoAsset') at module evaluation
  // time (ExpoAsset.js top-level). Pulled in transitively by `expo`.
  "expo-asset": path.resolve(__dirname, "shims/expo-asset.js"),
  // expo-keep-awake calls requireNativeModule('ExpoKeepAwake') at module
  // evaluation time. Common transitive dependency.
  "expo-keep-awake": path.resolve(__dirname, "shims/expo-keep-awake.js"),
  "react-native-svg": path.resolve(__dirname, "shims/react-native-svg.js"),
  "@react-native-community/netinfo": path.resolve(
    __dirname,
    "shims/react-native-community-netinfo.js",
  ),
  "@shopify/react-native-skia": path.resolve(
    __dirname,
    "shims/shopify-react-native-skia.js",
  ),
  "@rive-app/react-native": path.resolve(
    __dirname,
    "shims/rive-app-react-native.js",
  ),
  "react-native-nitro-modules": path.resolve(
    __dirname,
    "shims/react-native-nitro-modules.js",
  ),
  "react-native-gesture-handler": path.resolve(
    __dirname,
    "shims/react-native-gesture-handler.js",
  ),
  "react-native-reanimated": path.resolve(
    __dirname,
    "shims/react-native-reanimated.js",
  ),
  "react-native-safe-area-context": path.resolve(
    __dirname,
    "shims/react-native-safe-area-context.js",
  ),
  "react-native-screens": path.resolve(
    __dirname,
    "shims/react-native-screens.js",
  ),
  "react-native-screens/native-stack": path.resolve(
    __dirname,
    "shims/react-native-screens-native-stack.js",
  ),
  "expo-secure-store": path.resolve(__dirname, "shims/expo-secure-store.js"),
  "expo-system-ui": path.resolve(__dirname, "shims/expo-system-ui.js"),
  "expo-notifications": path.resolve(__dirname, "shims/expo-notifications.js"),
  "expo-document-picker": path.resolve(
    __dirname,
    "shims/expo-document-picker.js",
  ),
  "expo-sqlite": path.resolve(__dirname, "shims/expo-sqlite.js"),
  "expo-updates": path.resolve(__dirname, "shims/expo-updates.js"),
  "expo-web-browser": path.resolve(__dirname, "shims/expo-web-browser.js"),
  "expo-widgets": path.resolve(__dirname, "shims/expo-widgets.js"),
  "expo-symbols": path.resolve(__dirname, "shims/expo-symbols.js"),
  "expo-mesh-gradient": path.resolve(__dirname, "shims/expo-mesh-gradient.js"),
  "expo-status-bar": path.resolve(__dirname, "shims/expo-status-bar.js"),
  "expo-file-system": path.resolve(__dirname, "shims/expo-file-system.js"),
  "expo-constants": path.resolve(__dirname, "shims/expo-constants.js"),
  "expo-haptics": path.resolve(__dirname, "shims/expo-haptics.js"),
  "expo-splash-screen": path.resolve(__dirname, "shims/expo-splash-screen.js"),
  "@expo/ui": path.resolve(__dirname, "shims/expo-ui.js"),
  // @supabase/supabase-js: Rolldown's __commonJSMin CJS bundle breaks Metro's
  // ESM/CJS interop — named exports (createClient) come back undefined.
  // Shim loads the real CJS file by absolute path, bypassing package resolution.
  "@supabase/supabase-js": path.resolve(
    __dirname,
    "shims/supabase-js.js",
  ),
};

// IMPORTANT:
// Dev builds must not crash when opened in Expo Go or a remote debugger.
// Production/native builds still resolve real native modules.
// Shims must be enabled whenever we're NOT in a production native build.
// In Expo Go / dev / remote-debug, NODE_ENV is either undefined or "development".
const SHIMS_ENABLED =
  typeof process.env.NODE_ENV !== 'string' ||
  process.env.NODE_ENV !== 'production';

// Always-on shims: packages that will never have a working native module
// in React Native (e.g. pure React DOM libraries pulled in transitively).
// These must be shimmed in ALL environments, not just dev.
const ALWAYS_SHIM = new Set(["vaul"]);

// Precompute shim keys once to avoid re-allocating on every module resolution
const SHIM_PACKAGES = Object.keys(SHIMS);
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. Native module shim: exact match
  if (ALWAYS_SHIM.has(moduleName) || (SHIMS_ENABLED && SHIMS[moduleName])) {
    const shimPath = SHIMS[moduleName];
    if (shimPath) {
      if (process.env.NODE_ENV !== 'production') console.log('[metro-resolve] SHIM:', moduleName, '->', shimPath);
      return {
        filePath: shimPath,
        type: "sourceFile",
      };
    }
  }

  // 2. Subpath match: e.g. 'expo-blur/src/BlurView' → 'expo-blur'
  if (SHIMS_ENABLED) {
    const shimmedPackage = SHIM_PACKAGES.find(
      (pkg) => moduleName.startsWith(`${pkg}/`),
    );
    if (shimmedPackage) {
      const shimPath = SHIMS[shimmedPackage];
      if (shimPath) {
        return {
          filePath: shimPath,
          type: "sourceFile",
        };
      }
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
      if (process.env.NODE_ENV !== 'production') console.log('[metro-resolve] SUPABASE:', moduleName, '->', resolved);
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
