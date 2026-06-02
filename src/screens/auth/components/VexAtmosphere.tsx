import React, { memo, useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);

/* ─── Flowing curve lines (AURUM-style) ─── */
function FlowCurves() {
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: EASE_AMBIENT }), -1, true);
  }, [drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 24 - 12 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -40, left: 0, right: 0, height: 280 }, animatedStyle]}>
      <Svg width={width} height={280} viewBox={`0 0 ${width} 280`}>
        <Defs>
          <SvgLinearGradient id="curveGold" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="rgba(224,184,112,0)" />
            <Stop offset="50%" stopColor="rgba(224,184,112,0.20)" />
            <Stop offset="100%" stopColor="rgba(224,184,112,0)" />
          </SvgLinearGradient>
          <SvgLinearGradient id="curveTeal" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="rgba(94,234,212,0)" />
            <Stop offset="50%" stopColor="rgba(94,234,212,0.12)" />
            <Stop offset="100%" stopColor="rgba(94,234,212,0)" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={`M -40 180 Q ${width * 0.25} 60, ${width * 0.5} 140 T ${width + 40} 110`}
          stroke="url(#curveGold)" strokeWidth={0.8} fill="none"
        />
        <Path
          d={`M -40 210 Q ${width * 0.3} 100, ${width * 0.55} 175 T ${width + 40} 150`}
          stroke="url(#curveTeal)" strokeWidth={0.6} fill="none"
        />
        <Path
          d={`M -40 90 Q ${width * 0.2} 30, ${width * 0.45} 80 T ${width + 40} 50`}
          stroke="url(#curveGold)" strokeWidth={0.5} fill="none" opacity={0.5}
        />
      </Svg>
    </Animated.View>
  );
}

/* ─── Drifting dust particles (gold + cyan mix) ─── */
interface DustMote { x: number; y: number; size: number; dur: number; delay: number; hue: 'gold' | 'teal' | 'warm'; }
const DUST: DustMote[] = Array.from({ length: 38 }).map((_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.6 + 0.4,
  dur: 9000 + Math.random() * 9000,
  delay: Math.random() * 6000,
  hue: (['gold', 'teal', 'warm'] as const)[i % 3]!,
}));

function DustDot({ m }: { m: DustMote }) {
  const op = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    op.value = withDelay(m.delay, withRepeat(
      withTiming(0.85, { duration: m.dur * 0.4, easing: EASE_AMBIENT }),
      -1, true,
    ));
    ty.value = withDelay(m.delay, withRepeat(
      withTiming(-160, { duration: m.dur, easing: EASE_AMBIENT }),
      -1, false,
    ));
  }, [op, ty, m]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  const color = m.hue === 'gold' ? '#E0B870' : m.hue === 'teal' ? '#5EEAD4' : '#FBE4B0';

  return (
    <Animated.View pointerEvents="none" style={[
      {
        position: 'absolute',
        left: `${m.x}%`,
        top: `${m.y}%`,
        width: m.size,
        height: m.size,
        borderRadius: m.size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      style,
    ]} />
  );
}

/* ─── Soft glow orbs (very low opacity) ─── */
function SoftOrb({ cx, cy, r, color, dur, delay }: {
  cx: number; cy: number; r: number; color: string; dur: number; delay: number;
}) {
  const op = useSharedValue(0.4);
  const sc = useSharedValue(1);

  useEffect(() => {
    op.value = withDelay(delay, withRepeat(
      withTiming(0.7, { duration: dur, easing: EASE_AMBIENT }),
      -1, true,
    ));
    sc.value = withDelay(delay, withRepeat(
      withTiming(1.15, { duration: dur * 1.3, easing: EASE_AMBIENT }),
      -1, true,
    ));
  }, [op, sc, dur, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: sc.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: cx - r, top: cy - r }, style]}>
      <Svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
        <Defs>
          <RadialGradient id={`orb-${cx}-${cy}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Path d={`M ${r} 0 a ${r} ${r} 0 1 0 0 ${r * 2} a ${r} ${r} 0 1 0 0 -${r * 2}`} fill={`url(#orb-${cx}-${cy})`} />
      </Svg>
    </Animated.View>
  );
}

/* ─── Subtle film grain for texture ─── */
function Grain() {
  const { width, height } = useWindowDimensions();
  const dots = Array.from({ length: 80 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: Math.random() > 0.5 ? 1 : 1.5,
  }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height, opacity: 0.035 }}>
      {dots.map((d, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.s, height: d.s,
          backgroundColor: '#F5F1E8', borderRadius: d.s / 2,
        }} />
      ))}
    </View>
  );
}

/* ─── Top warm horizon glow (AURUM-style atmosphere) ─── */
function HorizonGlow() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55 }}>
      <LinearGradient
        colors={['rgba(224,184,112,0.05)', 'rgba(94,234,212,0.02)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', width, height: '100%' }}
      />
    </View>
  );
}

/* ─── Main atmosphere ─── */
export const VexAtmosphere = memo(function VexAtmosphere() {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height, top: 0, left: 0 }}>
      {/* Deep warm dark base */}
      <LinearGradient
        colors={['#08080C', '#0C0A12', '#0E0C16', '#08080C']}
        locations={[0, 0.35, 0.7, 1]}
        style={{ position: 'absolute', width, height }}
      />

      {/* Horizon warm wash */}
      <HorizonGlow />

      {/* Soft ambient orbs (very subtle) */}
      <SoftOrb cx={width * 0.18} cy={height * 0.22} r={220} color="#E0B870" dur={14000} delay={0} />
      <SoftOrb cx={width * 0.82} cy={height * 0.35} r={200} color="#5EEAD4" dur={17000} delay={3000} />
      <SoftOrb cx={width * 0.5} cy={height * 0.95} r={260} color="#E0B870" dur={20000} delay={6000} />

      {/* Flowing curve lines (AURUM signature) */}
      <FlowCurves />

      {/* Floating dust particles */}
      <View style={{ position: 'absolute', width, height }}>
        {DUST.map((m, i) => (<DustDot key={i} m={m} />))}
      </View>

      {/* Subtle film grain */}
      <Grain />

      {/* Bottom soft fade for legibility */}
      <LinearGradient
        colors={['transparent', 'rgba(8,8,12,0.6)']}
        locations={[0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', width, height: height * 0.4, bottom: 0, left: 0 }}
      />
    </View>
  );
});

export default VexAtmosphere;
