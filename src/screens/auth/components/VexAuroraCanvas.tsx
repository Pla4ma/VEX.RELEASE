import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

type GD = { x: string; y: string; w: number; h: number; o: number };
function grain(n: number): GD[] {
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
  const pulse = useSharedValue(0);
  const orbit = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 7000 }), -1, true);
    orbit.value = withRepeat(withTiming(1, { duration: 16000 }), -1, true);
  }, [isReducedMotion, pulse, orbit]);

  const core = useAnimatedStyle(() => ({
    opacity: 0.33 + pulse.value * 0.22,
    shadowRadius: 130 + pulse.value * 55,
  }));
  const r1 = useAnimatedStyle(() => ({ opacity: 0.10 + orbit.value * 0.07 }));
  const r2 = useAnimatedStyle(() => ({ opacity: 0.08 + (1 - orbit.value) * 0.07 }));
  const r3 = useAnimatedStyle(() => ({ opacity: 0.06 + pulse.value * 0.05 }));

  const g = useMemo(() => grain(50), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#03020B' }]} />

      {/* Violet aurora top half */}
      <View style={{
        position: 'absolute', top: '-25%', left: '-35%',
        width: '170%', height: '70%', borderRadius: 9999,
        backgroundColor: 'rgba(55,18,155,0.07)',
        shadowColor: '#6D3BFF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.62, shadowRadius: 290,
      }} />

      {/*Violet accent right*/}
      <View style={{
        position: 'absolute', top: '-5%', right: '-25%',
        width: '75%', height: '50%', borderRadius: 9999,
        backgroundColor: 'rgba(75,35,190,0.05)',
        shadowColor: '#A66BFF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.42, shadowRadius: 240,
      }} />

      {/*Orange core — rising*/}
      <Animated.View style={[{
        position: 'absolute', bottom: '-2%', alignSelf: 'center',
        width: 280, height: 120, borderRadius: 9999,
        backgroundColor: 'rgba(255,138,36,0.06)',
        shadowColor: '#FF8A24', shadowOffset: { width: 0, height: -18 },
      }, core]} />

      {/*Vertical focus beam*/}
      <LinearGradient
        colors={[
          'rgba(109,59,255,0)', 'rgba(109,59,255,0.06)',
          'rgba(109,59,255,0.11)', 'rgba(109,59,255,0)',
        ]}
        locations={[0, 0.20, 0.56, 1]}
        pointerEvents="none"
        style={{ position: 'absolute', left: '50%', top: '5%',
          bottom: '16%', width: 96, transform: [{ translateX: -48 }] }}
      />

      {/*Execution-loop rings*/}
      <Animated.View style={[{
        position: 'absolute', top: '9%', alignSelf: 'center',
        width: 430, height: 430, borderRadius: 9999,
        borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.18)',
      }, r1]} />
      <Animated.View style={[{
        position: 'absolute', top: '17%', alignSelf: 'center',
        width: 330, height: 330, borderRadius: 9999,
        borderWidth: 1.2, borderColor: 'rgba(166,107,255,0.14)',
      }, r2]} />
      <Animated.View style={[{
        position: 'absolute', top: '24%', alignSelf: 'center',
        width: 245, height: 245, borderRadius: 9999,
        borderWidth: 0.7, borderColor: 'rgba(255,138,36,0.10)',
      }, r3]} />
      <Animated.View style={{
        position: 'absolute', top: '30%', alignSelf: 'center',
        width: 175, height: 175, borderRadius: 9999,
        borderWidth: 0.5, borderColor: 'rgba(166,107,255,0.07)',
        opacity: 0.32,
      }} />

      {/*Vignette*/}
      <LinearGradient
        colors={['rgba(3,2,11,0.80)', 'rgba(3,2,11,0)', 'rgba(3,2,11,0.80)']}
        locations={[0, 0.5, 1]} pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%' }}
      />
      <LinearGradient
        colors={['rgba(3,2,11,0.66)', 'rgba(3,2,11,0)', 'rgba(3,2,11,0.66)']}
        locations={[0, 0.5, 1]} pointerEvents="none"
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%' }}
      />

      {/*Grain*/}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.017 }]}>
        {g.map((d, i) => {
          const s: ViewStyle = {
            position: 'absolute',
            top: d.x as unknown as ViewStyle['top'],
            left: d.y as unknown as ViewStyle['left'],
            width: d.w, height: d.h, borderRadius: 1,
            backgroundColor: '#FFFFFF', opacity: d.o,
          };
          return <View key={i} pointerEvents="none" style={s} />;
        })}
      </View>
    </View>
  );
}
