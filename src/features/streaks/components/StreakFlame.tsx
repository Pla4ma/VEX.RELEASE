import React from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { Icon } from '../../../icons';
import { glow } from '../../../theme/tokens/elevation';
import { launchColors } from '@theme/tokens/launch-colors';

export function StreakFlame({ days }: { days: number }): JSX.Element {
  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.1, { damping: 3, stiffness: 100 }),
            withSpring(1, { damping: 3, stiffness: 100 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));
  const getFlameSize = (): number => {
    if (days >= 100) {return 80;}
    if (days >= 60) {return 70;}
    if (days >= 30) {return 60;}
    return 50;
  };
  const getFlameColor = (): string => {
    if (days >= 100) {return launchColors.hex_f59e0b;}
    if (days >= 60) {return launchColors.hex_a855f7;}
    if (days >= 30) {return launchColors.hex_3b82f6;}
    return launchColors.hex_ef4444;
  };
  const size = getFlameSize();
  const flameColor = getFlameColor();
  return (
    <Animated.View
      style={[
        {
          width: size * 2,
          height: size * 2,
          borderRadius: size,
          backgroundColor: `${flameColor}30`,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: flameColor,
          ...glow(flameColor, 'soft'),
        },
        flameStyle,
      ]}
    >
      <Icon name="fire" size={size} color={flameColor} variant="solid" />
    </Animated.View>
  );
}

export function RewardItem({
  emoji,
  value,
  label,
  isNew = false,
}: {
  emoji: string;
  value: string;
  label: string;
  isNew?: boolean;
}): JSX.Element {
  return (
    <Box alignItems="center" gap="xs">
      <Box position="relative">
        <Text fontSize={40}>{emoji}</Text>
        {isNew && (
          <Box
            position="absolute"
            top={-8}
            right={-16}
            px="xs"
            py="xs"
            borderRadius="full"
            bg="success.DEFAULT"
          >
            <Text
              variant="caption"
              color="text.inverse"
              fontWeight="700"
              fontSize={10}
            >
              NEW
            </Text>
          </Box>
        )}
      </Box>
      <Text variant="h3" color="text.primary" fontWeight="700">
        {value}
      </Text>
      <Text variant="caption" color="text.tertiary">
        {label}
      </Text>
    </Box>
  );
}
