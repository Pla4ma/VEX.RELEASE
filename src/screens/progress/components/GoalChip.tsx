import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { buttonTap } from '../../../utils/haptics';
import { springPresets } from '../../../theme/tokens/motion';
import { useTheme } from '../../../theme/ThemeContext';


interface GoalChipProps {
  icon: string;
  label: string;
  isSelected: boolean;
  isReducedMotion: boolean;
  onPress: () => void;
}

export function GoalChip({
  icon,
  label,
  isSelected,
  isReducedMotion,
  onPress,
}: GoalChipProps): React.ReactNode {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = (): void => {
    buttonTap();
    if (!isReducedMotion) {
      scale.value = withSpring(0.94, springPresets.tactile);
    }
  };

  const onPressOut = (): void => {
    if (!isReducedMotion) {
      scale.value = withSpring(1, springPresets.settle);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityHint={`Select ${label} as your baseline`}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.surface.input,
          borderColor: isSelected ? theme.colors.primary[400] : theme.colors.border.DEFAULT,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          flexDirection: 'row',
          gap: theme.spacing[2],
          minHeight: 44,
          opacity: pressed ? 0.85 : 1,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[2],
        })}
      >
        <Icon
          color={isSelected ? theme.colors.text.inverse : theme.colors.primary[700]}
          name={icon}
          size="sm"
        />
        <Text color={isSelected ? 'text.inverse' : 'text.primary'} variant="label">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
