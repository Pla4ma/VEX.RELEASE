import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function GlassScreenAtmosphere({
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

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  variant?: GlassScreenAtmosphereVariant;
}

export const GlassScreen: React.FC<GlassScreenProps> = React.memo(function GlassScreen({
  children,
  showAura = true,
  contentStyle,
  testID,
  variant = 'default',
}: GlassScreenProps): React.ReactNode {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ backgroundColor: vexLightGlass.background.pageMid, flex: 1 }}
      testID={testID}
    >
      {showAura ? <GlassScreenAtmosphere variant={variant} /> : null}
      <View style={[{ flex: 1, paddingTop: insets.top, zIndex: 2 }, contentStyle]}>
        {children}
      </View>
    </View>
  );
});
