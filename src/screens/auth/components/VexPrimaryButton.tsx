import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { buttonTap } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

type Props = {
  label: string; loadingLabel: string; isLoading: boolean; onPress: () => void;
};

const PS = 0.96; const PM = 110; const PULSE = 5000;

export function VexActivationButton({
  label, loadingLabel, isLoading, onPress,
}: Props): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const sc = useSharedValue(1);
  const go = useSharedValue(0.15);
  const pp = useSharedValue(isReducedMotion ? 0.16 : 0);

  React.useEffect(() => {
    if (isReducedMotion) return;
    pp.value = withRepeat(
      withTiming(1, { duration: PULSE, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
  }, [pp, isReducedMotion]);

  const onIn = React.useCallback(() => {
    sc.value = withTiming(PS, { duration: PM });
    go.value = withTiming(0.62, { duration: PM });
  }, [sc, go]);
  const onOut = React.useCallback(() => {
    sc.value = withTiming(1, { duration: PM });
    go.value = withTiming(0.15, { duration: PM });
  }, [sc, go]);

  const as = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const gs = useAnimatedStyle(() => ({ shadowOpacity: go.value }));
  const au = useAnimatedStyle(() => ({ opacity: 0.10 + pp.value * 0.20 }));

  return (
    <View style={{ alignItems: 'center' }}>
      {/*Ambient pulse*/}
      <Animated.View pointerEvents="none" style={[{
        position: 'absolute', top: -40, bottom: -40, alignSelf: 'center',
        width: 380, borderRadius: 9999,
        backgroundColor: 'rgba(255,138,36,0.055)',
        shadowColor: '#FF8A24', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.68, shadowRadius: 100,
      }, au]} />
      {/*Orange shadow*/}
      <Animated.View style={[{
        position: 'absolute', top: 12, bottom: -12, alignSelf: 'center',
        width: '90%', borderRadius: theme.borderRadius['2xl'],
        shadowColor: '#FF8A24', shadowOffset: { width: 0, height: 18 },
        shadowRadius: 52,
      }, gs]} />
      {/*Violet left glow*/}
      <Animated.View pointerEvents="none" style={[{
        position: 'absolute', top: 16, bottom: -16,
        left: -16, width: 66, borderRadius: 9999,
        backgroundColor: 'rgba(139,92,246,0.035)',
        shadowColor: '#8B5CF6', shadowOffset: { width: 12, height: 0 },
        shadowOpacity: 0.22, shadowRadius: 48,
      }, au]} />

      <Animated.View style={[{
        borderRadius: theme.borderRadius['2xl'],
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.58, shadowRadius: 28, elevation: 16,
      }, as]}>
        <Pressable
          accessibilityHint="Authenticates and opens your VEX workspace"
          accessibilityLabel={label} accessibilityRole="button"
          accessibilityState={{ busy: isLoading, disabled: isLoading }}
          disabled={isLoading} onPressIn={onIn} onPressOut={onOut}
          onPress={() => { buttonTap(); onPress(); }}
          style={({ pressed }: { pressed: boolean }) => [
            getMinTouchTargetStyle(), {
              borderRadius: theme.borderRadius['2xl'], overflow: 'hidden',
              opacity: isLoading ? 0.85 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={['#7C3AED', '#A855F7', '#F59E0B', '#FF8A3D']}
            locations={[0, 0.30, 0.66, 1]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ minHeight: 64, alignItems: 'center',
              justifyContent: 'center', paddingHorizontal: theme.spacing[6] }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.24)', 'rgba(0,0,0,0)']}
              locations={[0, 0.34]} pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View pointerEvents="none" style={{
              position: 'absolute', top: 1, left: 26, right: 26,
              height: 1.5, backgroundColor: 'rgba(255,255,255,0.55)',
              borderRadius: 1,
            }} />
            <View pointerEvents="none" style={{
              position: 'absolute', top: 5, left: 54, right: 54,
              height: 0.5, backgroundColor: 'rgba(255,255,255,0.32)',
              borderRadius: 0.5,
            }} />
            <Text fontSize={17} fontWeight="700" letterSpacing={0.8}
              textAlign="center" style={{
                color: '#FFFFFF',
                textShadowColor: 'rgba(255,255,255,0.48)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 16,
              }}>
              {isLoading ? loadingLabel : `${label}  \u2192`}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
