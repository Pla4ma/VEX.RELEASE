import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

import { SafeBlurView } from './SafeBlurView';
import { useTheme } from '../../../theme';

type VexConsoleProps = {
  children: React.ReactNode;
};

const R = '3xl' as const;

export function VexConsole({ children }: VexConsoleProps): React.JSX.Element {
  const { theme } = useTheme();
  const r = theme.borderRadius[R];

  return (
    <View
      style={{
        borderRadius: r,
        shadowColor: lightColors.text.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.55,
        shadowRadius: 36,
        elevation: 16,
      }}
    >
      {/* Gradient border rim — violet through orange */}
      <LinearGradient
        colors={[
          rgbaColors.rgb_166_107_255_0_5,
          rgbaColors.rgb_139_92_246_0_18,
          rgbaColors.rgb_255_138_36_0_08,
          rgbaColors.rgb_255_138_36_0_3,
          rgbaColors.rgb_166_107_255_0_18,
          rgbaColors.rgb_139_92_246_0_5,
        ]}
        locations={[0, 0.15, 0.40, 0.55, 0.85, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: r + 1,
        }}
      />

      {/* Frosted glass body */}
      <View style={{ borderRadius: r, overflow: 'hidden', margin: 1 }}>
        <SafeBlurView intensity={38} tint="dark" style={{ borderRadius: r, overflow: 'hidden' }}>
          {/* Inner violet glow — top */}
          <LinearGradient
            colors={[rgbaColors.rgb_109_59_255_0_1, rgbaColors.rgb_109_59_255_0]}
            locations={[0, 0.25]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
          />

          {/* Inner orange reflection — bottom */}
          <LinearGradient
            colors={[rgbaColors.rgb_255_138_36_0, rgbaColors.rgb_255_138_36_0_06]}
            locations={[0, 0.8]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
          />

          {/* Specular top highlight line */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 24,
              right: 24,
              height: 1,
              backgroundColor: rgbaColors.rgb_255_255_255_0_12,
            }}
          />

          {/* Diagonal sheen */}
          <LinearGradient
            colors={[
              rgbaColors.rgb_255_255_255_0_03,
              rgbaColors.rgb_255_255_255_0,
              rgbaColors.rgb_255_255_255_0,
              rgbaColors.rgb_255_138_36_0_02,
            ]}
            locations={[0, 0.2, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Content */}
          <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
            {children}
          </View>
        </SafeBlurView>
      </View>
    </View>
  );
}
