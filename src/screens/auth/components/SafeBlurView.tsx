import React, { useMemo } from 'react';
import { View, type ViewProps } from 'react-native';

type SafeBlurViewProps = {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  children: React.ReactNode;
  style?: ViewProps['style'];
};

const looksLikeNativeBlurAvailable = false;

export function SafeBlurView({
  intensity = 30,
  tint = 'dark',
  children,
  style,
}: SafeBlurViewProps): React.JSX.Element {
  void intensity;

  const darkOverlay =
    tint === 'dark'
      ? 'rgba(7, 4, 19, 0.82)'
      : tint === 'light'
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(127, 127, 127, 0.28)';

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: darkOverlay,
        }}
      />
      {children}
    </View>
  );
}

export function useNativeBlurAvailable(): boolean {
  return useMemo(() => looksLikeNativeBlurAvailable, []);
}
