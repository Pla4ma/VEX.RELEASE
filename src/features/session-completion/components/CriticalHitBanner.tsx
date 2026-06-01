import React, { useEffect } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { triggerHapticPattern } from '../../../utils/haptics';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { LightningBolt, EnergyBurst } from './CriticalHitBanner.effects';

export interface CriticalHitBannerProps {
  xpAmount: number;
  onRevealComplete: () => void;
}

export function CriticalHitBanner({
  xpAmount,
  onRevealComplete,
}: CriticalHitBannerProps): JSX.Element {
  const { theme } = useTheme();
  useEffect(() => {
    const triggerHaptics = async () => {
      await triggerHapticPattern(['success', 'success'], 200);
    };
    triggerHaptics();
    const timer = setTimeout(() => {
      onRevealComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRevealComplete]);
  const bannerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(
          withSpring(0.5, { damping: 10 }),
          withSpring(1.1, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12 }),
        ),
      },
    ],
  }));
  const tripleXStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withDelay(
          1500,
          withSequence(
            withSpring(1.5, { damping: 5, stiffness: 200 }),
            withSpring(1, { damping: 10 }),
          ),
        ),
      },
    ],
    opacity: withDelay(1500, withTiming(1, { duration: 300 })),
  }));
  return (
    <Box flex={1} justifyContent="center" alignItems="center" px="xl">
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={[{ width: '100%', alignItems: 'center' }]}
      >
        {}
        <Box
          height={100}
          width={200}
          justifyContent="center"
          alignItems="center"
        >
          <LightningBolt delay={0} />
          <LightningBolt delay={200} />
          <LightningBolt delay={400} />
          <EnergyBurst />
        </Box>

        {}
        <Animated.View
          style={[
            {
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: `${theme.colors.accent.purple}30`,
              borderWidth: 3,
              borderColor: theme.colors.accent.purple,
              alignItems: 'center',
            },
            bannerStyle,
          ]}
        >
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={28}>⚡</Text>
            <Text
              fontSize={28}
              fontWeight="900"
              color={theme.colors.accent.purple}
              letterSpacing={2}
            >
              CRITICAL FOCUS
            </Text>
            <Text fontSize={28}>⚡</Text>
          </Box>
        </Animated.View>

        {}
        <Animated.View
          style={[
            { marginTop: 32, alignItems: 'center', opacity: 0 },
            tripleXStyle,
          ]}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            gap="md"
            px="xl"
            py="lg"
            borderRadius="xl"
            bg={`${theme.colors.accent.purple}20`}
            borderWidth={2}
            borderColor="accent.purple"
          >
            <Text fontSize={48}>✨</Text>
            <Box>
              <Text variant="hero" color="accent.purple" fontWeight="800">
                {xpAmount * 3}
              </Text>
              <Text variant="caption" color="text.tertiary">
                XP (3× CRITICAL!)
              </Text>
            </Box>
          </Box>
        </Animated.View>

        {}
        <Animated.View
          style={{
            marginTop: 16,
            opacity: withDelay(1500, withTiming(0.5, { duration: 300 })),
          }}
        >
          <Text
            variant="h4"
            color="text.tertiary"
            style={{ textDecorationLine: 'line-through' }}
          >
            Was: {xpAmount} XP
          </Text>
        </Animated.View>
      </Animated.View>
    </Box>
  );
}
export default CriticalHitBanner;
