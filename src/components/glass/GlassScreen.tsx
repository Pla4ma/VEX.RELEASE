import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VexMeshAtmosphere } from '../atmosphere/VexMeshAtmosphere';
import { LiquidGlassField } from './LiquidGlassField';
import type { AtmosphereVariant } from '../atmosphere/atmosphereTokens';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

/** Backward-compatible alias — maps to the atmosphere system's variant type. */
export type GlassScreenAtmosphereVariant = AtmosphereVariant;

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  variant?: GlassScreenAtmosphereVariant;
}

export const GlassScreen: React.ComponentType<GlassScreenProps> = React.memo(function GlassScreen({
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
      <LiquidGlassField />
      {showAura ? <VexMeshAtmosphere variant={variant} /> : null}
      <View style={[{ flex: 1, paddingTop: insets.top, zIndex: 2 }, contentStyle]}>
        {children}
      </View>
    </View>
  );
});
