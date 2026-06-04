import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors } from '@/theme/tokens/colors';

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
          'rgba(166, 107, 255, 0.50)',
          'rgba(139, 92, 246, 0.18)',
          'rgba(255, 138, 36, 0.08)',
          'rgba(255, 138, 36, 0.30)',
          'rgba(166, 107, 255, 0.18)',
          'rgba(139, 92, 246, 0.50)',
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
            colors={['rgba(109, 59, 255, 0.10)', 'rgba(109, 59, 255, 0)']}
            locations={[0, 0.25]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
          />

          {/* Inner orange reflection — bottom */}
          <LinearGradient
            colors={['rgba(255, 138, 36, 0)', 'rgba(255, 138, 36, 0.06)']}
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
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            }}
          />

          {/* Diagonal sheen */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.03)',
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0)',
              'rgba(255, 138, 36, 0.02)',
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
