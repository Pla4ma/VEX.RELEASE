import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLG, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import Animated, {
  useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';

function StatusDot(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const p = useSharedValue(isReducedMotion ? 0.6 : 0.15);
  React.useEffect(() => {
    if (isReducedMotion) return;
    p.value = withRepeat(withTiming(1, { duration: 2600 }), -1, true);
  }, [p, isReducedMotion]);
  const s = useAnimatedStyle(() => ({
    opacity: 0.35 + p.value * 0.65,
    transform: [{ scale: 0.76 + p.value * 0.24 }],
  }));
  return (
    <Animated.View style={[{
      width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80',
      shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.50, shadowRadius: 6,
    }, s]} />
  );
}

function FocusCore(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const p = useSharedValue(isReducedMotion ? 0.5 : 0);
  React.useEffect(() => {
    if (isReducedMotion) return;
    p.value = withRepeat(withTiming(1, { duration: 3200 }), -1, true);
  }, [p, isReducedMotion]);
  const g = useAnimatedStyle(() => ({
    opacity: 0.30 + p.value * 0.35,
    shadowRadius: 8 + p.value * 8,
  }));
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{
        position: 'absolute', width: 18, height: 18, borderRadius: 3,
        transform: [{ rotate: '45deg' }],
        backgroundColor: 'rgba(139,92,246,0.06)',
        shadowColor: '#A66BFF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
      }, g]} />
      <View style={{
        width: 12, height: 12, borderRadius: 2.5,
        transform: [{ rotate: '45deg' }], position: 'absolute',
        borderWidth: 1.5, borderColor: 'rgba(166,107,255,0.55)',
        backgroundColor: 'rgba(109,59,255,0.08)',
      }} />
      <View style={{
        position: 'absolute', width: 32, height: 0.5,
        backgroundColor: 'rgba(255,138,36,0.44)',
      }} />
      <View style={{
        position: 'absolute', height: 32, width: 0.5,
        backgroundColor: 'rgba(166,107,255,0.22)',
      }} />
    </View>
  );
}

/* eslint-disable max-lines-per-function */
export function VexBrandHeader(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      {/*Outer execution ring*/}
      <View pointerEvents="none" style={{
        position: 'absolute', top: -18, alignSelf: 'center',
        width: 248, height: 248, borderRadius: 9999,
        borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.11)',
      }} />
      {/*Inner ring*/}
      <View pointerEvents="none" style={{
        position: 'absolute', top: 2, alignSelf: 'center',
        width: 188, height: 188, borderRadius: 9999,
        borderWidth: 1, borderColor: 'rgba(166,107,255,0.08)',
      }} />
      {/*Soft fill*/}
      <View pointerEvents="none" style={{
        position: 'absolute', top: 12, alignSelf: 'center',
        width: 160, height: 120, borderRadius: 9999,
        backgroundColor: 'rgba(72,20,185,0.048)',
        shadowColor: '#6D3BFF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.42, shadowRadius: 84,
      }} />
      {/*Warm accent*/}
      <View pointerEvents="none" style={{
        position: 'absolute', top: 32, alignSelf: 'center',
        width: 90, height: 50, borderRadius: 9999,
        backgroundColor: 'rgba(255,138,36,0.032)',
        shadowColor: '#FF8A24', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16, shadowRadius: 42,
      }} />

      {/*Status pill*/}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 7,
        marginBottom: theme.spacing[3],
        paddingHorizontal: 14, paddingVertical: 4, borderRadius: 9999,
        backgroundColor: 'rgba(139,92,246,0.05)',
        borderWidth: 0.5, borderColor: 'rgba(139,92,246,0.10)',
      }}>
        <StatusDot />
        <Text color="semantic.liquidTextSoft" fontSize={11} fontWeight="500"
          opacity={0.54} letterSpacing={0.3}>System active</Text>
      </View>

      {/*===== CUSTOM GEOMETRIC WORDMARK =====*/}
      <View style={{ marginBottom: 10, alignItems: 'center' }}>
        {/*Strong violet glow plate behind*/}
        <View pointerEvents="none" style={{
          position: 'absolute', top: -10, bottom: -10,
          alignSelf: 'center', width: 210, borderRadius: 9999,
          backgroundColor: 'rgba(100,40,240,0.10)',
          shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.70, shadowRadius: 76,
        }} />
        {/*Orange warm bar below*/}
        <View pointerEvents="none" style={{
          position: 'absolute', bottom: -6, alignSelf: 'center',
          width: 120, height: 26, borderRadius: 9999,
          backgroundColor: 'rgba(255,138,36,0.06)',
          shadowColor: '#FF8A24', shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.30, shadowRadius: 44,
        }} />

        <Svg width={270} height={78} viewBox="0 0 270 78">
          <Defs>
            {/*GLOW layer gradient — violet/orange rim light*/}
            <SvgLG id="grGL" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#A66BFF" stopOpacity="0.65" />
              <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.20" />
              <Stop offset="100%" stopColor="#FF8A3D" stopOpacity="0.40" />
            </SvgLG>
            {/*MAIN text gradient — bright white top to warm silver bottom*/}
            <SvgLG id="grTX" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <Stop offset="70%" stopColor="#F5F0FF" stopOpacity="0.92" />
              <Stop offset="100%" stopColor="#E8DFFA" stopOpacity="0.88" />
            </SvgLG>
            {/*Bracket gradient*/}
            <SvgLG id="grBR" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#A66BFF" stopOpacity="0.60" />
              <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#A66BFF" stopOpacity="0.60" />
            </SvgLG>
          </Defs>

          {/*Glow layer — offset text with blur-like effect via lowered opacity violet/orange fill*/}
          <SvgText
            x="135" y="54" textAnchor="middle"
            fontSize="52" fontWeight="800" letterSpacing={5}
            fill="url(#grGL)"
            opacity="0.50"
          />

          {/*Main VEX text — white gradient, bright top to warm bottom*/}
          <SvgText
            x="135" y="54" textAnchor="middle"
            fontSize="52" fontWeight="800" letterSpacing={5}
            fill="url(#grTX)"
          />

          {/*Top rule — violet*/}
          <Rect x="50" y="8" width="170" height="0.6" rx="0.3" fill="rgba(166,107,255,0.35)" />

          {/*Left bracket — angular chevron*/}
          <Path
            d="M62 24 L48 40 L62 56"
            stroke="url(#grBR)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/*Right bracket — angular chevron*/}
          <Path
            d="M208 24 L222 40 L208 56"
            stroke="url(#grBR)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/*Bottom rule — orange*/}
          <Rect x="50" y="68" width="170" height="0.6" rx="0.3" fill="rgba(255,138,36,0.35)" />
        </Svg>
      </View>

      {/* Violet under-glow bar — second pass glow beneath mark */}
      <View pointerEvents="none" style={{
        alignSelf: 'center', width: 90, height: 18, borderRadius: 9999,
        marginTop: -18, marginBottom: 2,
        backgroundColor: 'rgba(139,92,246,0.04)',
        shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28, shadowRadius: 30,
      }} />

      {/*Connector + focus core*/}
      <View style={{ marginBottom: theme.spacing[2] }}>
        <View style={{
          alignSelf: 'center', width: 0.5, height: 12,
          backgroundColor: 'rgba(166,107,255,0.14)',
        }} />
        <FocusCore />
      </View>

      <Text
        color="semantic.liquidTextSoft" fontSize={14} fontWeight="500"
        letterSpacing={0.4} textAlign="center" opacity={0.66}
      >
        Your focus engine is ready.
      </Text>
    </View>
  );
}
