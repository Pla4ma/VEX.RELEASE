import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { springPresets, motionStagger } from '../../../theme/tokens/motion';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { lightColors } from '@/theme/tokens/colors';
import {
  FLOURISH_PATH_WAVE,
  FLOURISH_PATH_DIAMOND,
  FLOURISH_GRADIENT_STOPS,
  glowStyleDeepWarm,
  glowStyleTealAccent,
} from './VexHeroSignature.paths';

const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);

/* --- AURUM-style gold flourish above the wordmark --- */
function Flourish({ isReducedMotion }: { isReducedMotion: boolean }) {
  const draw = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    draw.value = withDelay(150, withTiming(1, { duration: 1200, easing: EASE_CINEMATIC }));
  }, [draw, isReducedMotion]);

  const style = useAnimatedStyle(() => ({ opacity: draw.value }));

  return (
    <Animated.View style={[{ width: 180, height: 18, alignItems: 'center' }, style]}>
      <Svg width={180} height={18} viewBox="0 0 180 18">
        <Defs>
          <SvgLinearGradient id="flourishGrad" x1="0" y1="0" x2="1" y2="0">
            {FLOURISH_GRADIENT_STOPS.map((s, i) => (
              <Stop key={i} offset={s.offset} stopColor={s.stopColor} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Path d={FLOURISH_PATH_WAVE} stroke="url(#flourishGrad)" strokeWidth={1.2} fill="none" />
        <Path d={FLOURISH_PATH_DIAMOND} stroke="rgba(224,184,112,0.85)" strokeWidth={1} fill="none" />
      </Svg>
    </Animated.View>
  );
}

/* --- VEX letter with refined multi-layer glow (type as art) --- */
function VexLetter({ char, index, isReducedMotion }: { char: string; index: number; isReducedMotion: boolean }) {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const ty = useSharedValue(isReducedMotion ? 0 : 40);
  const sc = useSharedValue(isReducedMotion ? 1 : 0.85);

  useEffect(() => {
    if (isReducedMotion) {return;}
    const d = 250 + index * motionStagger.tight;
    op.value = withDelay(d, withTiming(1, { duration: 900, easing: EASE_CINEMATIC }));
    ty.value = withDelay(d, withSpring(0, springPresets.settle));
    sc.value = withDelay(d, withSpring(1, springPresets.settle));
  }, [op, ty, sc, index, isReducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { scale: sc.value }],
  }));

  return (
    <Animated.View style={[{ marginHorizontal: 1 }, style]}>
      <Text style={glowStyleDeepWarm}>{char}</Text>
      <Text style={glowStyleTealAccent}>{char}</Text>
      <Text
        style={{
          fontSize: 88,
          fontWeight: '300',
          color: lightColors.surface.button,
          textShadowColor: 'rgba(224,184,112,0.30)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
          letterSpacing: 8,
        }}
      >
        {char}
      </Text>
    </Animated.View>
  );
}

/* --- Underline divider (gold gradient bar) --- */
function Underline({ isReducedMotion }: { isReducedMotion: boolean }) {
  const { theme: _theme } = useTheme();
  const scale = useSharedValue(isReducedMotion ? 1 : 0);
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    scale.value = withDelay(1300, withSpring(1, springPresets.settle));
    op.value = withDelay(1300, withTiming(1, { duration: 600 }));
    shimmer.value = withDelay(2400, withRepeat(
      withTiming(1, { duration: 3200, easing: EASE_CINEMATIC }),
      -1, false,
    ));
  }, [scale, op, shimmer, isReducedMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }], opacity: op.value }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmer.value * 140 - 70 }] }));

  return (
    <View style={{ width: 140, height: 1.5, overflow: 'hidden' }}>
      <Animated.View style={[
        { width: 140, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(224,184,112,0.45)' },
        style,
      ]} />
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: '50%', width: 60, height: 1.5, backgroundColor: 'rgba(255,228,176,0.95)' },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

/* --- Main signature --- */
export function VexHeroSignature({
  title = 'VEX',
  tagline = 'Protect one block. Leave with proof.',
}: {
  title?: string;
  tagline?: string;
}): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const tagOp = useSharedValue(isReducedMotion ? 1 : 0);
  const tagTy = useSharedValue(isReducedMotion ? 0 : 14);
  const microBreath = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    tagOp.value = withDelay(1500, withTiming(1, { duration: 700, easing: EASE_CINEMATIC }));
    tagTy.value = withDelay(1500, withTiming(0, { duration: 700, easing: EASE_CINEMATIC }));
    microBreath.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      -1, true,
    );
  }, [tagOp, tagTy, microBreath, isReducedMotion]);

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOp.value,
    transform: [{ translateY: tagTy.value }],
  }));

  const wordBreath = useAnimatedStyle(() => ({
    transform: [{ translateY: microBreath.value * 2 - 1 }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <Flourish isReducedMotion={isReducedMotion} />
      <Animated.View style={[{ flexDirection: 'row', marginTop: 4, height: 100 }, wordBreath]}>
        {title.split('').map((c, i) => (
          <VexLetter key={i} char={c} index={i} isReducedMotion={isReducedMotion} />
        ))}
      </Animated.View>
      <Underline isReducedMotion={isReducedMotion} />
      <Animated.View style={tagStyle}>
        <Text
          color="text.secondary"
          style={{ fontSize: 14, lineHeight: 20, fontWeight: '400', textAlign: 'center', maxWidth: 280, letterSpacing: 0.6, opacity: 0.85, marginTop: 4 }}
        >
          {tagline}
        </Text>
      </Animated.View>
    </View>
  );
}

export default VexHeroSignature;
