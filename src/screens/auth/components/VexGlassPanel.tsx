import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors } from '@/theme/tokens/colors';

import { SafeBlurView } from './SafeBlurView';
import { useTheme } from '../../../theme';

type VexConsoleProps = { children: React.ReactNode };

export function VexConsole({ children }: VexConsoleProps): React.JSX.Element {
  const { theme } = useTheme();
  const r = theme.borderRadius['3xl'];

  return (
    <View style={{ alignItems: 'center' }}>
      {/*Outer violet halo*/}
      <View pointerEvents="none" style={{
        position: 'absolute', top: -12, bottom: -12, left: -12, right: -12,
        borderRadius: r + 12, backgroundColor: 'rgba(109,59,255,0.020)',
        shadowColor: '#6D3BFF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.26, shadowRadius: 76,
      }} />
      {/*Orange beneath*/}
      <View pointerEvents="none" style={{
        position: 'absolute', bottom: -14, alignSelf: 'center',
        width: '60%', height: 44, borderRadius: 9999,
        backgroundColor: 'rgba(255,138,36,0.022)',
        shadowColor: '#FF8A24', shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.22, shadowRadius: 66,
      }} />

      {/*Card*/}
      <View style={{
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

        {/*Glass body*/}
        <View style={{ borderRadius: r, overflow: 'hidden', margin: 1 }}>
          <SafeBlurView intensity={46} tint="dark"
            style={{ borderRadius: r, overflow: 'hidden' }}>
            <LinearGradient
              colors={['rgba(109,59,255,0.16)', 'rgba(109,59,255,0)']}
              locations={[0, 0.30]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }}
            />
            <LinearGradient
              colors={['rgba(255,138,36,0)', 'rgba(255,138,36,0.12)']}
              locations={[0, 0.64]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 170 }}
            />
            <LinearGradient
              colors={['rgba(166,107,255,0.10)', 'rgba(166,107,255,0)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              pointerEvents="none"
              style={{ position: 'absolute', top: 20, left: 0, bottom: 20, width: 48 }}
            />
            <LinearGradient
              colors={['rgba(255,138,36,0.06)', 'rgba(255,138,36,0)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              pointerEvents="none"
              style={{ position: 'absolute', top: 20, right: 0, bottom: 20, width: 48 }}
            />

            {/*Diagonal reflection 18deg*/}
            <View pointerEvents="none" style={{
              position: 'absolute', top: -80, left: -80,
              width: 160, height: '160%', transform: [{ rotate: '18deg' }],
            }}>
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)', 'rgba(255,255,255,0.016)',
                  'rgba(255,255,255,0.050)', 'rgba(255,255,255,0.014)',
                  'rgba(255,255,255,0)',
                ]}
                locations={[0, 0.18, 0.44, 0.56, 1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </View>

            <View pointerEvents="none" style={{
              position: 'absolute', top: 0, left: 12, right: 12,
              height: 1.5, backgroundColor: 'rgba(255,255,255,0.26)',
              borderRadius: 1,
            }} />

            <LinearGradient
              colors={[
                'rgba(255,255,255,0.040)', 'rgba(255,255,255,0)',
                'rgba(255,255,255,0)', 'rgba(255,138,36,0.024)',
              ]}
              locations={[0, 0.12, 0.52, 1]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
              {children}
            </View>
          </SafeBlurView>
        </View>
      </View>
    </View>
  );
}
