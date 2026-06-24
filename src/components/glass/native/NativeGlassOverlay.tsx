import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { canUseNativeGlass } from './glassAvailability';
import { getGlassView } from './nativeModuleLoaders';

export interface NativeGlassOverlayProps {
  variant?: 'subtle' | 'hero' | 'nav' | 'pill' | 'selected';
  style?: StyleProp<ViewStyle>;
}

/**
 * Optional non-interactive glass sheen layer for hero surfaces and selected nav pills.
 * Always pointerEvents="none" — no content, no haptics, no business logic.
 */
export const NativeGlassOverlay = React.memo(function NativeGlassOverlay({
  variant = 'subtle',
  style,
}: NativeGlassOverlayProps): React.ReactNode {
  if (!canUseNativeGlass()) return null;

  const GlassViewC = getGlassView();
  const tintColor =
    variant === 'selected'
      ? 'rgba(95, 230, 197, 0.10)'
      : 'rgba(255, 255, 255, 0.12)';

  return (
    <View
      pointerEvents="none"
      style={[
        {
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        },
        style,
      ]}
    >
      <GlassViewC
        colorScheme="light"
        tintColor={tintColor}
        pointerEvents="none"
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          opacity: 0.5,
        }}
      />
    </View>
  );
});
