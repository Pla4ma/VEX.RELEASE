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

interface CreativeHomeSurfaceProps {
  viewModel: LaneViewModel;
}

export function CreativeHomeSurface({ viewModel }: CreativeHomeSurfaceProps): React.JSX.Element {
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

  const projects = viewModel.activeProjects ?? [];

  return (
    <Animated.View style={style}>
      <Box gap="md">
        {/* Projects Board */}
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
                🎨
              </Text>
            </Box>
            <Text variant="body" color="text.primary" style={{ fontWeight: '700' }}>
              Creative Spaces
            </Text>
          </Box>

          {projects.length > 0 ? (
            <Box gap="xs">
              {projects.slice(0, 3).map((project, i) => (
                <Pressable
                  key={i}
                  accessibilityLabel={`Project ${project.name}`}
                  accessibilityRole="button"
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Box gap="xs">
                    <Box flexDirection="row" justifyContent="space-between">
                      <Text variant="caption" color="text.primary" style={{ fontWeight: '500' }}>
                        {project.name}
                      </Text>
                      <Text variant="caption" color="text.secondary">
                        {Math.round(project.progress * 100)}%
                      </Text>
                    </Box>
                    <Box height={6} bg="semantic.surfaceElevated" borderRadius={3} overflow="hidden">
                      <Box
                        height={6}
                        borderRadius={3}
                        style={{
                          width: `${project.progress * 100}%`,
                          backgroundColor: project.color || theme.colors.semantic.secondary,
                        }}
                      />
                    </Box>
                  </Box>
                </Pressable>
              ))}
            </Box>
          ) : (
            <Text variant="caption" color="text.secondary">
              No active projects. Start a creative flow to begin.
            </Text>
          )}
        </Box>

        {/* Inspiration Prompt */}
        {viewModel.inspirationPrompt && (
          <Pressable
            accessibilityLabel="Inspiration prompt"
            accessibilityRole="button"
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
                💡 Inspiration
              </Text>
              <Text variant="body" color="text.primary" style={{ fontWeight: '500', marginTop: 4 }}>
                {viewModel.inspirationPrompt}
              </Text>
            </Box>
          </Pressable>
        )}

        {/* Quick Actions */}
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <LiquidButton
              label="Creative Flow"
              onPress={() => {}}
              variant="primary"
              leftIcon={<Text style={{ fontSize: 16 }}>🌊</Text>}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <LiquidButton
              label="Capture Idea"
              onPress={() => {}}
              variant="secondary"
              leftIcon={<Text style={{ fontSize: 16 }}>💡</Text>}
              fullWidth
            />
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}
