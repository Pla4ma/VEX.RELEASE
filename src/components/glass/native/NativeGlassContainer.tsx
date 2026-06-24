import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { canUseNativeGlass } from './glassAvailability';
import { getGlassContainer } from './nativeModuleLoaders';

export interface NativeGlassContainerProps {
  children?: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  pointerEvents?: ViewProps['pointerEvents'];
}

/**
 * Wraps multiple glass surfaces where the native API benefits from composition.
 * Falls back to a plain View when native glass is unavailable.
 */
export const NativeGlassContainer = React.memo(function NativeGlassContainer({
  children,
  spacing,
  style,
  testID,
  pointerEvents,
}: NativeGlassContainerProps): React.ReactNode {
  if (canUseNativeGlass()) {
    const GlassContainerC = getGlassContainer();
    return (
      <GlassContainerC
        spacing={spacing}
        testID={testID}
        pointerEvents={pointerEvents}
        style={[{ overflow: 'hidden' }, style]}
      >
        {children}
      </GlassContainerC>
    );
  }

  return (
    <View
      testID={testID}
      pointerEvents={pointerEvents}
      style={[{ overflow: 'hidden' }, style]}
    >
      {children}
    </View>
  );
});
