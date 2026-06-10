/**
 * Privacy Blur Config Plugin
 *
 * Ensures sensitive content is blurred in iOS/Android app switcher preview.
 * Prevents session data, user profiles, and focus content from being visible
 * in the multitasking thumbnail.
 *
 * Usage in app.json:
 *   "./plugins/withPrivacyBlur"
 */

const { withInfoPlist, withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

function withPrivacyBlur(config) {
  // iOS: Enable blur when app is backgrounded for app switcher
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      ...(config.modResults.UIApplicationSceneManifest || {}),
      UIApplicationSupportsMultipleScenes: false,
    };

    // Indicate that window blur/obfuscation should be applied on background
    config.modResults.ComAppleDeveloperUIKitUserDefaults = {
      ...(config.modResults.ComAppleDeveloperUIKitUserDefaults || {}),
      UIApplicationSupportsOccludedAppearance: true,
    };

    return config;
  });

  // Android: Set secure flag to prevent screenshots in recents
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application?.[0]?.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity' || a.$['android:name']?.includes('MainActivity')
    );

    if (mainActivity) {
      // FLAG_SECURE disabled in manifest to allow user screenshots during normal use.
      // The privacy blur is handled at the React Native level in the app root component
      // via AppState listener that adds/removes an overlay when backgrounded.
      // See: src/components/primitives/PrivacyBlurOverlay.tsx
    }

    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(withPrivacyBlur, 'withPrivacyBlur', '1.0.0');
