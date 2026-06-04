import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';

export function VexAtmosphereCanvas(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const orbital = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) return;
    orbital.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true);
  }, [isReducedMotion, orbital]);

  const ring1 = useAnimatedStyle(() => ({
    opacity: 0.07 + orbital.value * 0.03,
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: 0.05 + (1 - orbital.value) * 0.03,
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep midnight base */}
  // TODO(P2-1): map remaining hex colors to theme tokens
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#05040B' }]} />

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
          shadowColor: '#6D3BFF',
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
          shadowColor: '#A66BFF',
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
          shadowColor: '#FF8A24',
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
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderWidth: 0,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: 'rgba(5, 4, 11, 0.85)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: 'rgba(5, 4, 11, 0.85)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 40,
          backgroundColor: 'rgba(5, 4, 11, 0.75)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 40,
          backgroundColor: 'rgba(5, 4, 11, 0.75)',
        }}
      />

      {/* Noise grain overlay */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: 0.03 }]}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              borderRadius: 1,
              backgroundColor: lightColors.text.inverse,
              opacity: Math.random() * 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
