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

interface MinimalHomeSurfaceProps {
  viewModel: LaneViewModel;
}

export function MinimalHomeSurface({ viewModel }: MinimalHomeSurfaceProps): React.JSX.Element {
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

  return (
    <Animated.View style={style}>
      <Box gap="md">
        {/* Simple Stats */}
        <Box
          p="md"
          bg="semantic.surfaceGlass"
          borderRadius={24}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.semantic.liquidGlassBorder,
          }}
        >
          <Box flexDirection="row" justifyContent="space-around" alignItems="center">
            <Box alignItems="center">
              <Text variant="body" color="text.primary" style={{ fontWeight: '700', fontSize: 24 }}>
                {viewModel.todayFocusMinutes ?? 0}m
              </Text>
              <Text variant="caption" color="text.secondary">
                Today
              </Text>
            </Box>
            <Box
              width={1}
              height={40}
              bg="semantic.surfaceElevated"
            />
            <Box alignItems="center">
              <Text variant="body" color="text.primary" style={{ fontWeight: '700', fontSize: 24 }}>
                {viewModel.streakDays ?? 0}
              </Text>
              <Text variant="caption" color="text.secondary">
                Streak
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Quick Start */}
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <LiquidButton
              label="Focus"
              onPress={() => {}}
              variant="primary"
              leftIcon={<Text style={{ fontSize: 16 }}>🎯</Text>}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <LiquidButton
              label="Plan"
              onPress={() => {}}
              variant="secondary"
              leftIcon={<Text style={{ fontSize: 16 }}>📋</Text>}
              fullWidth
            />
          </Box>
        </Box>

        {/* Last Session */}
        {viewModel.lastSession && (
<Pressable
accessibilityLabel="Last session"
accessibilityRole="button"
accessibilityHint="Shows details from your last session"
onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Box
              p="md"
              bg="semantic.surfaceGlass"
              borderRadius={24}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.semantic.liquidGlassBorder,
              }}
            >
              <Text variant="caption" color="text.secondary">
                Last Session
              </Text>
              <Text variant="body" color="text.primary" style={{ fontWeight: '500', marginTop: 4 }}>
                {viewModel.lastSession}
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>
    </Animated.View>
  );
}
