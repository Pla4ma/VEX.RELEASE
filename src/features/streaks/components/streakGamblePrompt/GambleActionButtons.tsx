import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Box, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme';
import { GAMBLE_BONUS_XP } from './types';

interface GambleActionButtonsProps {
  shieldsAvailable: number;
  onUseShield: () => void;
  onGamble: () => void;
}

export const GambleActionButtons: React.FC<GambleActionButtonsProps> = ({
  shieldsAvailable,
  onUseShield,
  onGamble,
}) => {
  const { theme } = useTheme();
  const glowScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true,
    );
  }, [pulseOpacity]);

  const handleUseShield = () => {
    glowScale.value = withSpring(1.2, { damping: 10 }, () => {
      glowScale.value = withTiming(1, { duration: 200 });
      runOnJS(onUseShield)();
    });
  };

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Box gap={3}>
      <Animated.View style={glowStyle}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleUseShield}
          disabled={shieldsAvailable === 0}
          accessibilityLabel="Perform action"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Box flexDirection="row" alignItems="center" gap={2}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
            <Box alignItems="flex-start">
              <Text color={theme.colors.text.inverse} fontWeight="bold">
                Use Streak Shield
              </Text>
              <Text
                color={theme.colors.text.inverse}
                variant="caption"
                opacity={0.8}
              >
                {shieldsAvailable > 0
                  ? `Save streak guaranteed (${shieldsAvailable} available)`
                  : 'No shields available'}
              </Text>
            </Box>
          </Box>
        </Button>
      </Animated.View>

      <Box flexDirection="row" alignItems="center" gap={3} my={2}>
        <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
        <Text variant="caption" color={theme.colors.text.tertiary}>
          OR GAMBLE
        </Text>
        <Box flex={1} height={1} bg={theme.colors.border.DEFAULT} />
      </Box>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onPress={onGamble}
        style={{
          borderColor: theme.colors.warning.DEFAULT,
          borderWidth: 2,
        }}
        accessibilityLabel="Take the risk and start a session now to save streak"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box flexDirection="row" alignItems="center" gap={2}>
          <Text style={{ fontSize: 20 }}>🎲</Text>
          <Box alignItems="flex-start">
            <Text color={theme.colors.warning.DEFAULT} fontWeight="bold">
              Take the Risk
            </Text>
            <Text color={theme.colors.text.secondary} variant="caption">
              Start a session NOW - Score S or A to save streak
            </Text>
          </Box>
        </Box>
      </Button>

      <Animated.View style={pulseStyle}>
        <Box
          p={3}
          borderRadius={12}
          style={{
            backgroundColor: `${theme.colors.warning.DEFAULT}15`,
            borderWidth: 1,
            borderColor: `${theme.colors.warning.DEFAULT}30`,
          }}
        >
          <Text
            variant="caption"
            color={theme.colors.warning.DEFAULT}
            textAlign="center"
          >
            ⚡ If you score S or A: Streak saved + {GAMBLE_BONUS_XP} bonus
            XP!{'\n'}
            If below A: Streak breaks, no shield used
          </Text>
        </Box>
      </Animated.View>
    </Box>
  );
};
