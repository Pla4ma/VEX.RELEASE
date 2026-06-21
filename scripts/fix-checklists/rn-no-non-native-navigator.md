# rn-no-non-native-navigator — manual fix checklist

Diagnostics found: **5**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/navigation/MainNavigator.tsx

- L8: Users get JS-driven transitions and gestures from @react-navigation/bottom-tabs, instead of platform-native navigation behavior.

### src/navigation/components/TabButton.tsx

- L3: Users get JS-driven transitions and gestures from @react-navigation/bottom-tabs, instead of platform-native navigation behavior.

### src/navigation/components/VexTabBar.tsx

- L4: Users get JS-driven transitions and gestures from @react-navigation/bottom-tabs, instead of platform-native navigation behavior.

### src/navigation/param-types.ts

- L1: Users get JS-driven transitions and gestures from @react-navigation/bottom-tabs, instead of platform-native navigation behavior.

### src/types/navigation.ts

- L2: Users get JS-driven transitions and gestures from @react-navigation/bottom-tabs, instead of platform-native navigation behavior.
