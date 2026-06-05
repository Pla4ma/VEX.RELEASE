import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../theme';
import { rgbaColors } from '../../theme/tokens/rgba-colors';
import { lightColors } from '../../theme/tokens/colors';
import { AuroraField } from './AuroraField';

interface PremiumBackdropProps {
  intensity?: number;
}

const absoluteFill: ViewStyle = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

export function PremiumBackdrop({
  intensity = 0.58,
}: PremiumBackdropProps): JSX.Element {
  const { theme, isDark } = useTheme();
  const base = theme.colors.semantic.background;
  const top = isDark
    ? lightColors.semantic.liquidNight
    : theme.colors.semantic.backgroundElevated;
  const largeBloom = theme.spacing[20] * 4 + theme.spacing[10];
  const mediumBloom = theme.spacing[20] * 3 + theme.spacing[12];
  const offset = -(theme.spacing[24] + theme.spacing[6]);

  return (
    <View pointerEvents="none" style={absoluteFill}>
      <LinearGradient
        colors={[top, base, base]}
        locations={[0, 0.46, 1]}
        style={absoluteFill}
      />
      <AuroraField
        colors={[
          lightColors.semantic.vexCyanGlow,
          lightColors.semantic.editorialGoldGlow,
          rgbaColors.rgb_139_92_246_0_18,
        ]}
        intensity={intensity}
        size={largeBloom}
        style={{
          position: 'absolute',
          right: offset,
          top: -(theme.spacing[20] + theme.spacing[2]),
        }}
      />
      <AuroraField
        colors={[
          rgbaColors.rgb_94_234_212_0_12,
          rgbaColors.rgb_224_184_112_0_20,
          rgbaColors.rgb_59_130_246_0_15,
        ]}
        intensity={intensity * 0.72}
        size={mediumBloom}
        style={{ bottom: -theme.spacing[24], left: offset, position: 'absolute' }}
      />
      <LinearGradient
        colors={[
          rgbaColors.rgb_255_255_255_0_03,
          rgbaColors.rgb_255_255_255_0,
          rgbaColors.rgb_0_0_0_0_14,
        ]}
        locations={[0, 0.54, 1]}
        style={absoluteFill}
      />
    </View>
  );
}
