import React, { useMemo } from 'react';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

import type { BossTier } from './BossPreviewCard.types';
import { lightColors } from '@/theme/tokens/colors';

function getTierConfig(tier: BossTier, fallbackColor: string, fallbackBg: string) {
  if (tier === 'LEGENDARY') {
    return { color: lightColors.semantic.warning, bg: 'rgba(245,158,11,0.2)', label: 'LEGENDARY' };
  }
  if (tier === 'EPIC') {
    return { color: lightColors.accent.purple, bg: 'rgba(168,85,247,0.2)', label: 'EPIC' };
  }
  if (tier === 'RARE') {
    return { color: lightColors.accent.blue, bg: 'rgba(59,130,246,0.2)', label: 'RARE' };
  }
  if (tier === 'UNCOMMON') {
    return { color: lightColors.semantic.success, bg: 'rgba(34,197,94,0.2)', label: 'UNCOMMON' };
  }
  return { color: fallbackColor, bg: fallbackBg, label: 'COMMON' };
}

export function TierBadge({ tier }: { tier: BossTier }): React.ReactNode {
  const { theme } = useTheme();
  const tierConfig = useMemo(
    () => getTierConfig(tier, theme.colors.text.tertiary, theme.colors.background.tertiary),
    [tier, theme],
  );
  return (
    <Box
      px="sm"
      py="xs"
      borderRadius="full"
      bg={tierConfig.bg}
      borderWidth={1}
      borderColor={tierConfig.color}
    >
      <Text
        variant="caption"
        color={tierConfig.color}
        fontWeight="700"
        fontSize={10}
      >
        {tierConfig.label}
      </Text>
    </Box>
  );
}

export function BossTauntBubble({ taunt }: { taunt: string }): React.ReactNode {
  const { theme } = useTheme();
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(0, { damping: 15, stiffness: 100 }) }],
    opacity: withTiming(1, { duration: 400 }),
  }));
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(300)}
      style={slideStyle}
    >
      <Box
        position="absolute"
        top={-60}
        right={0}
        maxWidth={200}
        px="md"
        py="sm"
        borderRadius="lg"
        bg={`${theme.colors.error[500]}15`}
        borderWidth={1}
        borderColor={theme.colors.error[500]}
        style={{
          boxShadow: `0px 2px 4px ${theme.colors.error}[500] / 0.3`,
        }}
      >
        <Text
          variant="caption"
          color={theme.colors.error[500]}
          fontWeight="500"
        >
          {taunt}
        </Text>
        {}
        <Box
          position="absolute"
          bottom={-8}
          right={20}
          width={0}
          height={0}
          style={{
            borderLeftWidth: 8,
            borderRightWidth: 8,
            borderTopWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: theme.colors.error[500],
          }}
        />
      </Box>
    </Animated.View>
  );
}

export function DefeatIndicator(): React.ReactNode {
  const { theme } = useTheme();
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSpring(1.2, { damping: 2, stiffness: 200 }),
          -1,
          true,
        ),
      },
    ],
  }));
  return (
    <Animated.View style={bounceStyle}>
      <Box
        px="sm"
        py="xs"
        borderRadius="lg"
        bg={`${theme.colors.success[500]}20`}
        borderWidth={1}
        borderColor={theme.colors.success[500]}
      >
        <Text
          variant="caption"
          color={theme.colors.success[500]}
          fontWeight="700"
        >
          DEFEAT IMMINENT
        </Text>
      </Box>
    </Animated.View>
  );
}

export function FinalStrikeIndicator(): React.ReactNode {
  const { theme } = useTheme();
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1, { damping: 3, stiffness: 200 }),
            withSpring(1.1, { damping: 3, stiffness: 200 }),
          ),
          -1,
          true,
        ),
      },
    ],
    opacity: withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.7, { duration: 500 }),
      ),
      -1,
      true,
    ),
  }));
  return (
    <Animated.View style={pulseStyle}>
      <Box
        px="sm"
        py="xs"
        borderRadius="lg"
        bg={`${theme.colors.error[500]}25`}
        borderWidth={2}
        borderColor={theme.colors.error[500]}
      >
        <Text
          variant="caption"
          color={theme.colors.error[500]}
          fontWeight="800"
        >
          FINAL STRIKE AVAILABLE
        </Text>
      </Box>
    </Animated.View>
  );
}