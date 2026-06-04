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
import { FlowCurves, SoftOrb } from './VexAtmosphereEffects';
import { lightColors } from '@/theme/tokens/colors';

const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);

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

  const color = m.hue === 'gold' ? lightColors.semantic.vexGold : m.hue === 'teal' ? lightColors.semantic.auroraTeal : lightColors.semantic.auroraWarmLight;

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
          backgroundColor: lightColors.surface.button, borderRadius: d.s / 2,
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
        colors={[lightColors.semantic.atmosphereBase1, lightColors.semantic.atmosphereBase2, lightColors.semantic.atmosphereBase3, lightColors.semantic.atmosphereBase1]}
        locations={[0, 0.35, 0.7, 1]}
        style={{ position: 'absolute', width, height }}
      />

      {/* Horizon warm wash */}
      <HorizonGlow />

      {/* Soft ambient orbs (very subtle) */}
      <SoftOrb cx={width * 0.18} cy={height * 0.22} r={220} color={lightColors.semantic.auroraEditorialGold} dur={14000} delay={0} />
      <SoftOrb cx={width * 0.82} cy={height * 0.35} r={200} color={lightColors.semantic.auroraTeal} dur={17000} delay={3000} />
      <SoftOrb cx={width * 0.5} cy={height * 0.95} r={260} color={lightColors.semantic.auroraEditorialGold} dur={20000} delay={6000} />

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
