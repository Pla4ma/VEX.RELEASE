import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export type GlassScreenAtmosphereVariant =
  | 'home'
  | 'focus'
  | 'progress'
  | 'profile'
  | 'default';

function WarmTint({
  variant,
}: {
  variant: GlassScreenAtmosphereVariant;
}): string {
  if (variant === 'home') {
    return vexLightGlass.background.atmosphericFire;
  }
  if (variant === 'profile') {
    return vexLightGlass.background.atmosphericFire;
  }
  return vexLightGlass.background.transparent;
}

export function GlassScreenAtmosphere({
  variant,
}: {
  variant: GlassScreenAtmosphereVariant;
}): React.ReactNode {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: vexLightGlass.background.pageTop,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      <LinearGradient
        colors={[
          vexLightGlass.background.pageTop,
          vexLightGlass.background.atmosphericPearl,
          vexLightGlass.background.pageMid,
        ]}
        locations={[0, 0.42, 1]}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <LinearGradient
        colors={[
          WarmTint({ variant }),
          vexLightGlass.background.transparent,
          vexLightGlass.background.atmosphericMint,
        ]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{ bottom: 0, left: 0, opacity: 0.5, position: 'absolute', right: 0, top: 0 }}
      />
    </View>
  );
}
