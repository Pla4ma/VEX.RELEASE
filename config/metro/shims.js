/* global __dirname */
const path = require("node:path");
const projectRoot = path.resolve(__dirname, "../..");

module.exports = {
  "react-native-mmkv": path.resolve(projectRoot, "shims/react-native-mmkv.js"),
  "react-native-purchases": path.resolve(
    projectRoot,
    "shims/react-native-purchases.js",
  ),
  "@sentry/react-native": path.resolve(
    projectRoot,
    "shims/sentry-react-native.js",
  ),
  "@sentry/react-native/metro": path.resolve(
    projectRoot,
    "shims/sentry-react-native.js",
  ),
  "posthog-react-native": path.resolve(
    projectRoot,
    "shims/posthog-react-native.js",
  ),
  // vaul is a React DOM drawer imported unconditionally by @expo/ui.
  // Its transitive deps (@radix-ui/react-dialog, react-remove-scroll,
  // aria-hidden, etc.) access browser globals at module init time and
  // must never be bundled into the React Native runtime.
  "vaul": path.resolve(projectRoot, "shims/vaul.js"),
  // expo-glass-effect calls requireNativeViewManager('ExpoGlassEffect')
  // at module evaluation time (GlassView.ios.js top-level const). This
  // fires before the runtime bridge is ready, crashing with:
  //   ERROR  [runtime not ready]: TypeError: undefined is not a function
  // Same fix as @sentry/react-native — shim for dev, real module in production.
  "expo-glass-effect": path.resolve(projectRoot, "shims/expo-glass-effect.js"),
  // expo-blur calls requireNativeViewManager('ExpoBlur') at module level
  // in NativeBlurModule.js — same early-native-access pattern.
  "expo-blur": path.resolve(projectRoot, "shims/expo-blur.js"),
  // expo-linear-gradient calls requireNativeViewManager('ExpoLinearGradient')
  // at module evaluation time. In Expo Go / remote-debug startup this can run
  // before the native runtime is ready and throw:
  //   ERROR  [runtime not ready]: TypeError: undefined is not a function
  "expo-linear-gradient": path.resolve(
    projectRoot,
    "shims/expo-linear-gradient.js",
  ),
  // expo-image creates ExpoImage native view at module evaluation time.
  "expo-image": path.resolve(projectRoot, "shims/expo-image.js"),
  // expo-apple-authentication creates ExpoAppleAuthenticationButton native view
  // at module evaluation time even when only auth helpers are imported.
  "expo-apple-authentication": path.resolve(
    projectRoot,
    "shims/expo-apple-authentication.js",
  ),
  // expo-font calls requireNativeModule('ExpoFontLoader') at module evaluation
  // time (ExpoFontLoader.js top-level const). Pulled in transitively by `expo`
  // which is imported at the top of App.tsx. Fires before the bridge is ready.
  "expo-font": path.resolve(projectRoot, "shims/expo-font.js"),
  // expo-asset calls requireNativeModule('ExpoAsset') at module evaluation
  // time (ExpoAsset.js top-level). Pulled in transitively by `expo`.
  "expo-asset": path.resolve(projectRoot, "shims/expo-asset.js"),
  // expo-keep-awake calls requireNativeModule('ExpoKeepAwake') at module
  // evaluation time. Common transitive dependency.
  "expo-keep-awake": path.resolve(projectRoot, "shims/expo-keep-awake.js"),
  "react-native-svg": path.resolve(projectRoot, "shims/react-native-svg.js"),
  "@react-native-community/netinfo": path.resolve(
    projectRoot,
    "shims/react-native-community-netinfo.js",
  ),
  "@shopify/react-native-skia": path.resolve(
    projectRoot,
    "shims/shopify-react-native-skia.js",
  ),
  "@rive-app/react-native": path.resolve(
    projectRoot,
    "shims/rive-app-react-native.js",
  ),
  "react-native-nitro-modules": path.resolve(
    projectRoot,
    "shims/react-native-nitro-modules.js",
  ),
  "react-native-gesture-handler": path.resolve(
    projectRoot,
    "shims/react-native-gesture-handler.js",
  ),
  "react-native-reanimated": path.resolve(
    projectRoot,
    "shims/react-native-reanimated.js",
  ),
  "react-native-safe-area-context": path.resolve(
    projectRoot,
    "shims/react-native-safe-area-context.js",
  ),
  "react-native-screens": path.resolve(
    projectRoot,
    "shims/react-native-screens.js",
  ),
  "react-native-screens/native-stack": path.resolve(
    projectRoot,
    "shims/react-native-screens-native-stack.js",
  ),
  "expo-secure-store": path.resolve(projectRoot, "shims/expo-secure-store.js"),
  "expo-system-ui": path.resolve(projectRoot, "shims/expo-system-ui.js"),
  "expo-notifications": path.resolve(projectRoot, "shims/expo-notifications.js"),
  "expo-document-picker": path.resolve(
    projectRoot,
    "shims/expo-document-picker.js",
  ),
  "expo-sqlite": path.resolve(projectRoot, "shims/expo-sqlite.js"),
  "expo-updates": path.resolve(projectRoot, "shims/expo-updates.js"),
  "expo-web-browser": path.resolve(projectRoot, "shims/expo-web-browser.js"),
  "expo-widgets": path.resolve(projectRoot, "shims/expo-widgets.js"),
  "expo-symbols": path.resolve(projectRoot, "shims/expo-symbols.js"),
  "expo-mesh-gradient": path.resolve(projectRoot, "shims/expo-mesh-gradient.js"),
  "expo-status-bar": path.resolve(projectRoot, "shims/expo-status-bar.js"),
  "expo-file-system": path.resolve(projectRoot, "shims/expo-file-system.js"),
  "expo-constants": path.resolve(projectRoot, "shims/expo-constants.js"),
  "expo-haptics": path.resolve(projectRoot, "shims/expo-haptics.js"),
  "expo-splash-screen": path.resolve(projectRoot, "shims/expo-splash-screen.js"),
  "@expo/ui": path.resolve(projectRoot, "shims/expo-ui.js"),
  // @supabase/supabase-js: Rolldown's __commonJSMin CJS bundle breaks Metro's
  // ESM/CJS interop — named exports (createClient) come back undefined.
  // Shim loads the real CJS file by absolute path, bypassing package resolution.
  "@supabase/supabase-js": path.resolve(
    projectRoot,
    "shims/supabase-js.js",
  ),
};
