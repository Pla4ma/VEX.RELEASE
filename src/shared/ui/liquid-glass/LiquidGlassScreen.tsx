import React from 'react';
import { ImageBackground, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../../theme/ThemeContext';
import { liquidGlassSpacing } from './liquidGlassTokens';

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
      <LinearGradient
        colors={[
          theme.colors.semantic.background,
          theme.colors.semantic.backgroundMuted,
          theme.colors.semantic.background,
        ]}
        locations={[0, 0.58, 1]}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <ImageBackground
        source={require('../../../assets/generated/session/liquid-glass-plate.png')}
        resizeMode="cover"
        style={{ bottom: 0, left: 0, opacity: 0.42, position: 'absolute', right: 0, top: 0 }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: theme.colors.semantic.vexCyanSoft,
          borderRadius: liquidGlassSpacing.screenBottom * 4,
          height: liquidGlassSpacing.screenBottom * 8,
          opacity: 0.72,
          position: 'absolute',
          right: -liquidGlassSpacing.screenBottom,
          top: liquidGlassSpacing.screenBottom * 4,
          width: liquidGlassSpacing.screenBottom * 5,
        }}
      />
      <View
        pointerEvents="none"
        style={{
  backgroundColor: theme.colors.semantic.vexGoldSoft,
  borderRadius: liquidGlassSpacing.screenBottom * 3,
  bottom: -liquidGlassSpacing.screenBottom,
  height: liquidGlassSpacing.screenBottom * 6,
  left: -liquidGlassSpacing.screenBottom,
  opacity: 0.46,
  position: 'absolute',
  width: liquidGlassSpacing.screenBottom * 4,
}}
      />
      {children}
    </View>
  );
}
