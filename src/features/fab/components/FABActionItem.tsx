import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  FadeInUp,
  type SharedValue,
} from 'react-native-reanimated';

import { Icon } from '../../../icons/components/Icon';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { FABAction } from '../types';

interface FABActionItemProps {
  action: FABAction;
  index: number;
  menuProgress: SharedValue<number>;
  actionItemHeight: number;
  onPress: (actionId: string) => void;
}

export function FABActionItem({
  action,
  index,
  menuProgress,
  actionItemHeight,
  onPress,
}: FABActionItemProps): React.ReactNode {
  const itemStyle = useAnimatedStyle(() => {
    const delay = index * 0.05;
    const adjustedProgress = Math.max(
      0,
      Math.min(1, (menuProgress.value - delay) / (1 - delay)),
    );
    return {
      opacity: adjustedProgress,
      transform: [
        {
          translateY: interpolate(
            adjustedProgress,
            [0, 1],
            [20, -(index + 1) * actionItemHeight],
          ),
        },
        { scale: interpolate(adjustedProgress, [0, 1], [0.7, 1]) },
      ],
    };
  });

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40)}
      style={[
        itemStyle,
        {
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          right: 0,
        },
      ]}
    >
      <Pressable
        accessibilityHint={action.label}
        accessibilityLabel={action.label}
        accessibilityRole="button"
        onPress={() => onPress(action.id)}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed
            ? vexLightGlass.mint[100]
            : vexLightGlass.background.pageTop,
          borderColor: vexLightGlass.glass.borderSubtle,
          borderRadius: 12,
          borderWidth: 1,
          flexDirection: 'row',
          gap: 10,
          marginRight: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          shadowColor: vexLightGlass.glass.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        })}
      >
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 14,
            fontWeight: '600',
          }}
        >
          {action.label}
        </Text>
        <Icon
          color={action.color ?? vexLightGlass.mint[600]}
          name={action.icon}
          size="sm"
          variant="solid"
        />
      </Pressable>
    </Animated.View>
  );
}
