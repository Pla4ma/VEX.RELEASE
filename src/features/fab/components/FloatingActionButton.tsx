import React, { useState, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { Icon } from '../../../icons/components/Icon';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useHaptics } from '../../../utils/haptics';
import { springPresets, timingPresets } from '../../../theme/tokens/motion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { FABAction } from '../types';
import { FABActionItem } from './FABActionItem';

interface FloatingActionButtonProps {
  actions: FABAction[];
  onActionPress: (actionId: string) => void;
}

const FAB_SIZE = 56;
const ACTION_ITEM_HEIGHT = 52;

export function FloatingActionButton({
  actions,
  onActionPress,
}: FloatingActionButtonProps): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const haptics = useHaptics();
  const [isOpen, setIsOpen] = useState(false);
  const menuProgress = useSharedValue(0);
  const rotateProgress = useSharedValue(0);

  const toggleMenu = useCallback(() => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    haptics.light();
    if (isReducedMotion) {
      menuProgress.value = nextOpen ? 1 : 0;
      rotateProgress.value = nextOpen ? 1 : 0;
      return;
    }
    menuProgress.value = withSpring(nextOpen ? 1 : 0, springPresets.tactile);
    rotateProgress.value = withTiming(nextOpen ? 1 : 0, {
      duration: timingPresets.enter.duration,
    });
  }, [isOpen, isReducedMotion, menuProgress, rotateProgress, haptics]);

  const handleActionPress = useCallback(
    (actionId: string) => {
      toggleMenu();
      onActionPress(actionId);
    },
    [onActionPress, toggleMenu],
  );

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(rotateProgress.value, [0, 1], [0, 45])}deg`,
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuProgress.value, [0, 1], [0, 0.4]),
    pointerEvents: menuProgress.value > 0.5 ? 'auto' : 'none',
  }));

  return (
    <View
      style={{
        bottom: 100,
        position: 'absolute',
        right: 24,
        zIndex: 999,
      }}
      pointerEvents="box-none"
    >
      {/* Overlay */}
      <Animated.View
        style={[
          {
            ...overlayStyle,
            bottom: -100,
            left: -400,
            position: 'absolute',
            right: -24,
            top: -800,
          },
        ]}
      >
        <Pressable
          onPress={toggleMenu}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
        />
      </Animated.View>

      {/* Action items */}
      {actions.map((action, index) => (
        <FABActionItem
          key={action.id}
          action={action}
          index={index}
          menuProgress={menuProgress}
          actionItemHeight={ACTION_ITEM_HEIGHT}
          onPress={handleActionPress}
        />
      ))}

      {/* Main FAB button */}
      <Pressable
        accessibilityHint="Open quick actions menu"
        accessibilityLabel="Quick actions"
        accessibilityRole="button"
        onPress={toggleMenu}
        style={({ pressed }) => ({
          ...getMinTouchTargetStyle(),
          alignItems: 'center',
          backgroundColor: pressed
            ? vexLightGlass.mint[700]
            : vexLightGlass.mint[600],
          borderRadius: FAB_SIZE / 2,
          elevation: 6,
          height: FAB_SIZE,
          justifyContent: 'center',
          shadowColor: vexLightGlass.mint[600],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          width: FAB_SIZE,
          zIndex: 1000,
        })}
      >
        <Animated.View style={mainButtonStyle}>
          <Icon
            color={vexLightGlass.background.pageTop}
            name="plus"
            size="lg"
            strokeWidth={2}
            variant="solid"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}
