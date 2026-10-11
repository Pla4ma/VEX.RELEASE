const ADAPTERS = new Set(['vaul', '@supabase/supabase-js']);
const EXPO_GO_NATIVE_MODULES = new Set([
  'expo-blur', 'expo-linear-gradient', 'expo-glass-effect', 'expo-mesh-gradient',
  'expo-haptics', 'expo-image', 'expo-font', 'expo-asset', 'expo-constants',
  'expo-status-bar', 'expo-splash-screen', 'expo-system-ui', 'expo-keep-awake',
  'react-native-svg', 'react-native-reanimated', 'react-native-gesture-handler',
  'react-native-safe-area-context', 'react-native-screens', 'react-native-screens/native-stack',
]);

function shouldShim(moduleName, platform, development, environment) {
  if (ADAPTERS.has(moduleName)) return true;
  const native = platform === 'ios' || platform === 'android';
  // Native releases must use real SDKs even if a stale developer flag is set.
  if (native && !development) return false;
  if (native) {
    if (environment.VEX_FORCE_SHIMS === '1') return true;
    if (EXPO_GO_NATIVE_MODULES.has(moduleName)) return false;
    return environment.EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS === '1';
  }
  return true;
}

module.exports = { shouldShim };
