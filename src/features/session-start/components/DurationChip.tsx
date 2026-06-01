import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { cardSelection } from '../../../utils/haptics';

export function DurationChip({
  minutes,
  isSelected,
  onPress,
}: {
  minutes: number;
  isSelected: boolean;
  onPress: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePress = () => {
    cardSelection();
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={`Select ${minutes} minute duration`}
      accessibilityRole="button"
      accessibilityHint="Selects this session duration"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
            borderRadius: theme.borderRadius.xl,
            backgroundColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.background.secondary,
            borderWidth: 2,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.border.DEFAULT,
            marginRight: theme.spacing[2],
          },
        ]}
      >
        <Text
          variant="body"
          color={isSelected ? 'text.inverse' : 'text.primary'}
          fontWeight={isSelected ? '700' : '500'}
        >
          {minutes} min
        </Text>
      </Animated.View>
    </Pressable>
  );
}
