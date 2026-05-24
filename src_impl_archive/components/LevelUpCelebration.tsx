import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Box, Text } from './primitives';
import { useTheme } from '../theme';

type LevelUpCelebrationProps = {
  oldLevel: number;
  newLevel: number;
  rewards: string[];
  onDismiss: () => void;
};

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  oldLevel,
  newLevel,
  rewards,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const levelScale = useSharedValue(0.7);

  useEffect(() => {
    levelScale.value = withSpring(1, { damping: 10, stiffness: 150 });
    const timeoutId = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timeoutId);
  }, [levelScale, onDismiss]);

  const levelStyle = useAnimatedStyle(() => ({ transform: [{ scale: levelScale.value }] }));

  // Guard: don't render if no actual level up occurred
  if (newLevel <= oldLevel) {return null;}

  return (
    <Pressable onPress={onDismiss} style={{ flex: 1 }}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Animated.View entering={FadeIn.duration(220)} style={{ flex: 1 }}>
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          px={24}
          style={{ backgroundColor: `${theme.colors.background.primary}EE` }}
        >
          <Box
            width="100%"
            p={24}
            borderRadius={28}
            alignItems="center"
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderWidth: 2,
              borderColor: theme.colors.primary[500],
            }}
          >
            <Text variant="label" color={theme.colors.primary[500]}>
              LEVEL UP
            </Text>
            <Animated.View style={levelStyle}>
              <Text
                variant="hero"
                color={theme.colors.primary[500]}
                style={{ fontSize: 84, lineHeight: 92 }}
              >
                {newLevel}
              </Text>
            </Animated.View>
            <Text variant="body" color={theme.colors.text.secondary} style={{ marginTop: 4 }}>
              Level {oldLevel} to Level {newLevel}
            </Text>
            <Box width="100%" mt={20} gap={10}>
              {rewards.map((reward, index) => (
                <Animated.View
                  key={`${reward}-${index}`}
                  entering={FadeInUp.delay(index * 150).duration(260)}
                >
                  <Box
                    p={14}
                    borderRadius={18}
                    style={{ backgroundColor: theme.colors.background.primary }}
                  >
                    <Text variant="body" color={theme.colors.text.primary}>
                      {reward}
                    </Text>
                  </Box>
                </Animated.View>
              ))}
            </Box>
            <Text variant="caption" color={theme.colors.text.tertiary} style={{ marginTop: 18 }}>
              Tap anywhere to continue
            </Text>
          </Box>
        </Box>
      </Animated.View>
    </Pressable>
  );
};
