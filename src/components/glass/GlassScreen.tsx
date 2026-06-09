import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import {
  GlassScreenAtmosphere,
  type GlassScreenAtmosphereVariant,
} from './GlassScreenAtmosphere';

interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  variant?: GlassScreenAtmosphereVariant;
}

export function GlassScreen({
  children,
  showAura = true,
  contentStyle,
  testID,
  variant = 'default',
}: GlassScreenProps): JSX.Element {
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
}

export default GlassScreen;
