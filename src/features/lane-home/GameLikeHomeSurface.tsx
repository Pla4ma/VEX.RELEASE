import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { LiquidButton } from '../../components/glass/LiquidButton';
import type { LaneViewModel } from './service';

interface GameLikeHomeSurfaceProps {
  viewModel: LaneViewModel;
}

export function GameLikeHomeSurface({ viewModel }: GameLikeHomeSurfaceProps): React.JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withSpring(1, { damping: 20 });
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const bossHealth = viewModel.bossHealth ?? 0;
  const bossMax = viewModel.bossMaxHealth ?? 100;
  const healthPercent = bossMax > 0 ? bossHealth / bossMax : 0;

  return (
    <Animated.View style={style}>
      <Box gap="md">
        {/* Boss Battle Card */}
        <Pressable
          accessibilityLabel="Boss battle"
          accessibilityRole="button"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Box
            p="md"
            gap="sm"
            bg="semantic.surfaceGlass"
            borderRadius={24}
            style={{
              borderWidth: 2,
              borderColor: theme.colors.semantic.warning,
            }}
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box
                width={40}
                height={40}
                borderRadius={12}
                bg="semantic.surfaceElevated"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="body" style={{ fontSize: 20 }}>
                  👾
                </Text>
              </Box>
              <Box flex={1}>
                <Text variant="body" color="text.primary" style={{ fontWeight: '700' }}>
                  Boss Battle
                </Text>
              </Box>
              {Boolean(viewModel.currentRank) && (
                <Box px="sm" py="xs" bg="semantic.surfaceElevated" borderRadius={999}>
                  <Text variant="caption" color="text.secondary" style={{ fontWeight: '600' }}>
                    {viewModel.currentRank}
                  </Text>
                </Box>
              )}
            </Box>

            <Box gap="xs">
              <Box flexDirection="row" justifyContent="space-between">
                <Text variant="caption" color="text.secondary">
                  Boss Health
                </Text>
                <Text variant="caption" color="text.secondary">
                  {bossHealth}/{bossMax}
                </Text>
              </Box>
              <Box height={10} bg="semantic.surfaceElevated" borderRadius={5} overflow="hidden">
                <Box
                  height={10}
                  bg="semantic.warning"
                  borderRadius={5}
                  style={{ width: `${healthPercent * 100}%` }}
                />
              </Box>
            </Box>

            {viewModel.weeklyDamage !== undefined && (
              <Text variant="caption" color="text.secondary">
                Weekly damage: {viewModel.weeklyDamage} ⚔️
              </Text>
            )}
          </Box>
        </Pressable>

        {/* Streak Counter */}
        <Box
          p="md"
          bg="semantic.surfaceGlass"
          borderRadius={24}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.semantic.liquidGlassBorder,
          }}
        >
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text variant="body" style={{ fontSize: 24 }}>
                🔥
              </Text>
              <Box>
                <Text variant="body" color="text.primary" style={{ fontWeight: '700' }}>
                  {viewModel.streakDays ?? 0} Day Streak
                </Text>
                <Text variant="caption" color="text.secondary">
                  Keep the fire alive
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <LiquidButton
              label="Attack Boss"
              onPress={() => {}}
              variant="fire"
              leftIcon={<Text style={{ fontSize: 16 }}>⚔️</Text>}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <LiquidButton
              label="Sprint"
              onPress={() => {}}
              variant="secondary"
              leftIcon={<Text style={{ fontSize: 16 }}>⚡</Text>}
              fullWidth
            />
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}
