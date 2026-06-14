import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { RiveCompanion } from './RiveCompanion';
import type { CompanionState } from '../types';

interface AmbientHomeCompanionProps {
  companionState: CompanionState;
  onPress?: () => void;
  onLongPress?: () => void;
  recentActivity?: string;
  greeting?: string;
}

export function AmbientHomeCompanion({
  companionState,
  onPress,
  onLongPress,
  recentActivity,
  greeting,
}: AmbientHomeCompanionProps): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pressScale = useSharedValue(1);
  const breathe = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) {return;}
    breathe.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breathe, isReducedMotion]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    opacity: interpolate(breathe.value, [0, 1], [0.92, 1]),
  }));

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.96, { damping: 15 });
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 15 });
  }, [pressScale]);

  const message = greeting ?? companionState.currentMood;
  const activityText = recentActivity
    ? `${recentActivity} • ${message}`
    : message;

  return (
    <Pressable
      accessibilityLabel="Your companion"
      accessibilityRole="button"
      accessibilityHint="Double tap to open companion space"
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[4],
            padding: theme.spacing[4],
            backgroundColor: theme.colors.semantic.surfaceGlass,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.colors.semantic.liquidGlassBorder,
          },
          bubbleStyle,
        ]}
      >
        <RiveCompanion
          companionState={companionState}
          size={72}
          isSpeaking={!!greeting}
        />
        <Box flex={1} gap="xs">
          <Text variant="body" color="text.primary" style={{ fontWeight: '600' }}>
            {companionState.phase} Level {companionState.level}
          </Text>
          <Text variant="caption" color="text.secondary" style={{ lineHeight: 18 }}>
            {activityText}
          </Text>
        </Box>
      </Animated.View>
    </Pressable>
  );
}
