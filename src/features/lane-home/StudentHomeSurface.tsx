import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { LiquidButton } from '../../components/glass/LiquidButton';
import type { LaneViewModel } from './service';

interface StudentHomeSurfaceProps {
  viewModel: LaneViewModel;
}

export function StudentHomeSurface({ viewModel }: StudentHomeSurfaceProps): React.JSX.Element {
  const { theme } = useTheme();
  const cardScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withSpring(1, { damping: 20 });
  }, [opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 15 });
  };

  const tasks = viewModel.todayTasks ?? [];
  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  return (
    <Animated.View style={containerStyle}>
      <Box gap="md">
        {/* Study Plan Card */}
        <Pressable
          accessibilityLabel="Study plan"
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
              borderWidth: 1,
              borderColor: theme.colors.semantic.liquidGlassBorder,
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
                  📚
                </Text>
              </Box>
              <Box flex={1}>
                <Text variant="body" color="text.primary" style={{ fontWeight: '700' }}>
                  {viewModel.hasStudyPlan ? 'Study Plan Active' : 'Set Up Study Plan'}
                </Text>
              </Box>
            </Box>

            {tasks.length > 0 && (
              <Box gap="xs">
                <Box flexDirection="row" justifyContent="space-between">
                  <Text variant="caption" color="text.secondary">
                    Today&apos;s tasks
                  </Text>
                  <Text variant="caption" color="text.secondary">
                    {completedCount}/{tasks.length}
                  </Text>
                </Box>
                <Box
                  height={6}
                  bg="semantic.surfaceElevated"
                  borderRadius={3}
                  overflow="hidden"
                >
                  <Box
                    height={6}
                    bg="semantic.secondary"
                    borderRadius={3}
                    style={{
                      width: `${progress * 100}%`,
                    }}
                  />
                </Box>
                {tasks.slice(0, 3).map((task, i) => (
                  <Box key={i} flexDirection="row" alignItems="center" gap="xs">
                    <Text variant="caption" style={{ fontSize: 12 }}>
                      {task.done ? '✅' : '⬜'}
                    </Text>
                    <Text
                      variant="caption"
                      color={task.done ? 'text.secondary' : 'text.primary'}
                      style={{
                        textDecorationLine: task.done ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Pressable>

        {/* Quick Actions */}
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <LiquidButton
              label="Study Session"
              onPress={() => {}}
              variant="primary"
              leftIcon={<Text style={{ fontSize: 16 }}>📖</Text>}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <LiquidButton
              label="Review"
              onPress={() => {}}
              variant="secondary"
              leftIcon={<Text style={{ fontSize: 16 }}>📝</Text>}
              fullWidth
            />
          </Box>
        </Box>

        {/* Week Progress */}
        {viewModel.weekProgress !== undefined && (
          <Box
            p="md"
            bg="semantic.surfaceGlass"
            borderRadius={24}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.semantic.liquidGlassBorder,
            }}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text variant="label" color="text.primary">
                Week Progress
              </Text>
              <Text variant="caption" color="text.secondary">
                {Math.round((viewModel.weekProgress ?? 0) * 100)}%
              </Text>
            </Box>
            <Box
              height={8}
              bg="semantic.surfaceElevated"
              borderRadius={4}
              overflow="hidden"
              mt="xs"
            >
              <Box
                height={8}
                bg="semantic.success"
                borderRadius={4}
                style={{
                  width: `${(viewModel.weekProgress ?? 0) * 100}%`,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Animated.View>
  );
}
