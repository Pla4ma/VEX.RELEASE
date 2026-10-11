const { test } = require('node:test');
const assert = require('node:assert/strict');
const { shouldShim } = require('../../config/metro/shim-policy');
const shims = require('../../config/metro/shims');

for (const platform of ['android', 'ios']) {
  test(`${platform} releases keep real SDKs despite stale Expo Go flags`, () => {
    for (const name of Object.keys(shims)) {
      if (name === 'vaul' || name === '@supabase/supabase-js') continue;
      assert.equal(shouldShim(name, platform, false,
        { EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS: '1', VEX_FORCE_SHIMS: '1' }), false, name);
    }
  });
}
test('native development clients use real modules unless Expo Go is explicitly selected', () => {
  assert.equal(shouldShim('@sentry/react-native', 'android', true, {}), false);
  assert.equal(shouldShim('react-native-mmkv', 'android', true,
    { EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS: '1' }), true);
  assert.equal(shouldShim('react-native-reanimated', 'android', true,
    { EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS: '1' }), false);
});
test('DOM isolation and real Supabase adapter remain available on native releases', () => {
  assert.equal(shouldShim('vaul', 'android', false, {}), true);
  assert.equal(shouldShim('@supabase/supabase-js', 'ios', false, {}), true);
});
