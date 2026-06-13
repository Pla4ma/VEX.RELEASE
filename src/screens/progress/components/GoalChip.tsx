import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { buttonTap } from '../../../utils/haptics';
import { springPresets } from '../../../theme/tokens/motion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
}: GoalChipProps): JSX.Element {
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
          backgroundColor: isSelected
            ? vexLightGlass.mint[500]
            : vexLightGlass.glass.fill,
          borderColor: isSelected
            ? vexLightGlass.mint[400]
            : vexLightGlass.glass.border,
          borderRadius: 999,
          borderWidth: 1,
          elevation: isSelected ? 3 : 1,
          flexDirection: 'row',
          gap: 6,
          opacity: pressed ? 0.85 : 1,
          paddingHorizontal: 14,
          paddingVertical: 10,
          shadowColor: vexLightGlass.glass.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isSelected ? 0.22 : 0.1,
          shadowRadius: isSelected ? 8 : 4,
        })}
      >
        <Icon
          color={isSelected ? '#FFFFFF' : vexLightGlass.mint[700]}
          name={icon}
          size="sm"
        />
        <Text
          style={{
            color: isSelected ? '#FFFFFF' : vexLightGlass.text.primary,
            fontSize: 13,
            fontWeight: isSelected ? '800' : '700',
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
