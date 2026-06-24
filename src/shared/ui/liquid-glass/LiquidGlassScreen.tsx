import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { VexMeshAtmosphere } from '../../../components/atmosphere/VexMeshAtmosphere';

type LiquidGlassScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function LiquidGlassScreen({
  children,
  style,
}: LiquidGlassScreenProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.semantic.background,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <VexMeshAtmosphere variant="default" />
      {children}
    </View>
  );
}
