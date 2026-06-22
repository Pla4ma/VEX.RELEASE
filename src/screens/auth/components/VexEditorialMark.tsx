import React, { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { EditorialFlourish } from './EditorialFlourish';
import { VexLetter } from './VexLetter';
import { EditorialRule } from './EditorialRule';

        
const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);
const SERIF_STACK = Platform.select({
  ios: 'New York',
  android: 'Noto Serif',
  default: 'Georgia',
}) ?? 'Georgia';

/**
 * VexEditorialMark — the hero "VEX" wordmark for the Editorial Devotional
 * direction. Orchestrates the flourish, the three serif letters, the
 * editorial rule, the italic tagline, and the publication caption.
 */
export function VexEditorialMark({
  title = 'VEX',
  edition = 'Vol. I',
  tagline = 'Protect one block. Leave with proof.',
}: {
  title?: string;
  edition?: string;
  tagline?: string;
}): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const tagOp = useSharedValue(isReducedMotion ? 1 : 0);
  const tagTy = useSharedValue(isReducedMotion ? 0 : 14);
  const edOp = useSharedValue(isReducedMotion ? 1 : 0);
  const microBreath = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    edOp.value = withDelay(100, withTiming(1, { duration: 700, easing: EASE_CINEMATIC }));
    tagOp.value = withDelay(1500, withTiming(1, { duration: 700, easing: EASE_CINEMATIC }));
    tagTy.value = withDelay(1500, withTiming(0, { duration: 700, easing: EASE_CINEMATIC }));
    microBreath.value = withDelay(
      1800,
      withRepeat(
        withTiming(1, { duration: 5200, easing: EASE_AMBIENT }),
        -1,
        true,
      ),
    );
  }, [tagOp, tagTy, edOp, microBreath, isReducedMotion]);

  const edStyle = useAnimatedStyle(() => ({ opacity: edOp.value }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOp.value,
    transform: [{ translateY: tagTy.value }],
  }));
  const wordBreath = useAnimatedStyle(() => ({
    transform: [{ translateY: microBreath.value * 2 - 1 }],
  }));

  const letters = useMemo(() => title.split(''), [title]);

  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <Animated.View style={edStyle}>
        <Text
          style={{
            color: rgbaColors.rgb_224_184_112_0_85,
            fontSize: 12,
            fontFamily: SERIF_STACK,
            fontWeight: '500',
            letterSpacing: 5,
            textTransform: 'uppercase',
          }}
        >
          {`— ${edition} —`}
        </Text>
      </Animated.View>

      <EditorialFlourish isReducedMotion={isReducedMotion} />

      <Animated.View style={[{ flexDirection: 'row', marginTop: 2, height: 140 }, wordBreath]}>
        {letters.map((c, i) => (
          <VexLetter key={`letter-${c}-${i}`} char={c} index={i} isReducedMotion={isReducedMotion} />
        ))}
      </Animated.View>

      <EditorialRule isReducedMotion={isReducedMotion} />

      <Animated.View style={tagStyle}>
        <Text
          color="text.secondary"
          style={{}}
        >
          {tagline}
        </Text>
      </Animated.View>

      <Animated.View style={tagStyle}>
        <Text
          style={{
            color: rgbaColors.rgb_224_184_112_0_55,
            fontSize: 12,
            fontFamily: SERIF_STACK,
            fontWeight: '500',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          {`An editorial practice · ${new Date().getFullYear()}`}
        </Text>
      </Animated.View>
    </View>
  );
}

export default VexEditorialMark;
