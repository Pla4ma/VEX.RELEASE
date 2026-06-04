import React, { useEffect } from 'react';
import { View } from 'react-native';
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
import { motionStagger } from '../../../theme/tokens/motion';
import { HoloCard } from './HoloCard';
import { lightColors } from '@/theme/tokens/colors';

const STEPS = [
  { label: '01', title: 'Begin', detail: 'Open one protected block of focus' },
  { label: '02', title: 'Defend', detail: 'Stay uninterrupted until the timer ends' },
  { label: '03', title: 'Return', detail: 'Carry proof of progress into tomorrow' },
] as const;

const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);

/* ─── Clean step indicator (one accent dot, no busy pulses) ─── */
function StepDot({ active, isReducedMotion }: { active: boolean; isReducedMotion: boolean }) {
  const op = useSharedValue(active ? 1 : 0.4);
  const sc = useSharedValue(active ? 1 : 0.8);

  useEffect(() => {
    if (isReducedMotion) return;
    if (active) {
      op.value = withRepeat(
        withTiming(0.65, { duration: 2400, easing: EASE_CINEMATIC }),
        -1, true,
      );
    } else {
      op.value = withTiming(0.45, { duration: 400 });
      sc.value = withTiming(0.85, { duration: 400 });
    }
  }, [op, sc, active, isReducedMotion]);

  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: sc.value }] }));

  return (
    <Animated.View style={[
      {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: active ? lightColors.semantic.vexGold : 'rgba(245,241,232,0.25)',
        shadowColor: active ? lightColors.semantic.vexGold : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: active ? 0.9 : 0,
        shadowRadius: 8,
      },
      style,
    ]} />
  );
}

/* ─── Step block with stagger entrance ─── */
function StepBlock({ step, index, isReducedMotion }: {
  step: typeof STEPS[number]; index: number; isReducedMotion: boolean;
}) {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const tx = useSharedValue(isReducedMotion ? 0 : -16);

  useEffect(() => {
    if (isReducedMotion) return;
    const d = 1000 + index * motionStagger.loose;
    op.value = withDelay(d, withTiming(1, { duration: 700, easing: EASE_CINEMATIC }));
    tx.value = withDelay(d, withTiming(0, { duration: 700, easing: EASE_CINEMATIC }));
  }, [op, tx, index, isReducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1, gap: 6, alignItems: 'flex-start' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <StepDot active={index === 0} isReducedMotion={isReducedMotion} />
        <Text color="rgba(224,184,112,0.85)" style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2.5 }}>
          {step.label}
        </Text>
      </View>
      <Text color="text.primary" style={{ fontSize: 17, fontWeight: '600', letterSpacing: 0.2, marginTop: 2 }}>
        {step.title}
      </Text>
      <Text color="text.muted" style={{ fontSize: 12, lineHeight: 17, fontWeight: '400', opacity: 0.8, maxWidth: 140 }}>
        {step.detail}
      </Text>
    </Animated.View>
  );
}

/* ─── Connector hairline between steps ─── */
function Connector({ visible }: { visible: boolean }) {
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withDelay(1400, withTiming(visible ? 1 : 0, { duration: 700 }));
  }, [op, visible]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[
      { width: 18, height: 1, backgroundColor: 'rgba(224,184,112,0.35)', marginTop: 3.5 },
      style,
    ]} />
  );
}

/* ─── Main data loop ─── */
export function VexDataLoop(): JSX.Element {
  const { isReducedMotion } = useReducedMotion();

  return (
    <HoloCard accent="gold" borderRadius={22} innerPadding={22} delay={400}>
      <View accessibilityLabel="VEX focus loop" accessibilityRole="text" style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color="rgba(224,184,112,0.85)" style={{ fontSize: 10, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' }}>
            The Loop
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(94,234,212,0.6)' }} />
            <Text color="text.muted" style={{ fontSize: 10, fontWeight: '500', letterSpacing: 1.5, opacity: 0.7 }}>
              ACTIVE
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              <StepBlock step={s} index={i} isReducedMotion={isReducedMotion} />
              {i < STEPS.length - 1 && <Connector visible />}
            </React.Fragment>
          ))}
        </View>
      </View>
    </HoloCard>
  );
}

export default VexDataLoop;
