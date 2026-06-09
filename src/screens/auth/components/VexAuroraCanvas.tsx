import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';
import { useOrbitalAnimation, renderNoiseGrain } from './VexAuroraCanvas.helpers';

type GD = { x: string; y: string; w: number; h: number; o: number };
function _grain(n: number): GD[] {
  const d: GD[] = [];
  for (let i = 0; i < n; i++) { d.push({
    x: `${(i * 37 + 13) % 100}%`, y: `${(i * 73 + 41) % 100}%`,
    w: 2 + ((i * 17) % 3), h: 2 + ((i * 23) % 3),
    o: 0.13 + ((i * 53) % 100) * 0.003,
  }); }
  return d;
}

export function VexAtmosphereCanvas(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { ring1, ring2 } = useOrbitalAnimation(isReducedMotion);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep midnight base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: lightColors.semantic.auroraMidnight }]} />

      {/* Violet nebula — upper left */}
      <View
        style={{
          position: 'absolute',
          top: '-25%',
          left: '-35%',
          width: '110%',
          height: '70%',
          borderRadius: 9999,
          backgroundColor: 'rgba(69, 30, 160, 0.07)',
          shadowColor: lightColors.semantic.auroraBrightViolet,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 220,
        }}
      />

      {/* Violet accent — mid right */}
      <View
        style={{
          position: 'absolute',
          top: '10%',
          right: '-30%',
          width: '90%',
          height: '50%',
          borderRadius: 9999,
          backgroundColor: 'rgba(88, 48, 200, 0.04)',
          shadowColor: lightColors.semantic.auroraAccentViolet,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 180,
        }}
      />

      {/* Deep violet anchor — center background */}
      <View
        style={{
          position: 'absolute',
          top: '25%',
          alignSelf: 'center',
          width: 300,
          height: 300,
          borderRadius: 9999,
          backgroundColor: 'rgba(30, 10, 60, 0.3)',
        }}
      />

      {/* Orange focus core — lower center */}
      <View
        style={{
          position: 'absolute',
          bottom: '5%',
          alignSelf: 'center',
          width: 200,
          height: 90,
          borderRadius: 9999,
          backgroundColor: 'rgba(255, 138, 36, 0.04)',
          shadowColor: lightColors.semantic.brandOrange,
          shadowOffset: { width: 0, height: -30 },
          shadowOpacity: 0.45,
          shadowRadius: 130,
        }}
      />

      {/* Orbital ring 1 — outer */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: '18%',
            alignSelf: 'center',
            width: 340,
            height: 340,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.12)',
          },
          ring1,
        ]}
      />

      {/* Orbital ring 2 — mid */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: '26%',
            alignSelf: 'center',
            width: 260,
            height: 260,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: 'rgba(166, 107, 255, 0.08)',
          },
          ring2,
        ]}
      />

      {/* Orbital ring 3 — inner */}
      <Animated.View
        style={{
          position: 'absolute',
          top: '34%',
          alignSelf: 'center',
          width: 180,
          height: 180,
          borderRadius: 9999,
          borderWidth: 0.5,
          borderColor: 'rgba(255, 138, 36, 0.06)',
          opacity: 0.5,
        }}
      />

      {/* Edge vignette */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 0 }]} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(5, 4, 11, 0.85)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(5, 4, 11, 0.85)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 40, backgroundColor: 'rgba(5, 4, 11, 0.75)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 40, backgroundColor: 'rgba(5, 4, 11, 0.75)' }} />

      {/* Noise grain overlay */}
      {renderNoiseGrain()}
    </View>
  );
}
