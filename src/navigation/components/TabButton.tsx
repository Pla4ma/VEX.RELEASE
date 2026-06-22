import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '../../icons/components/Icon';
import { Text } from '../../components/primitives/Text';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { tabSwitch } from '../../utils/haptics';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { springPresets, timingPresets } from '../../theme/tokens/motion';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { ActiveTabPill } from './ActiveTabPill';

const ICONS = {
  Home: 'home',
  Focus: 'check-circle',
  Progress: 'chart',
  Profile: 'user',
} as const;

function getRouteIcon(routeName: string): string {
  switch (routeName) {
    case 'Focus':
      return ICONS.Focus;
    case 'Progress':
      return ICONS.Progress;
    case 'Profile':
      return ICONS.Profile;
    default:
      return ICONS.Home;
  }
}

export interface TabButtonProps {
  route: BottomTabBarProps['state']['routes'][number];
  focused: boolean;
  color: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  isActiveTab: boolean;
  isPulsing?: boolean;
  pulseStart?: number | null;
}

export function TabButton({
  route,
  focused,
  color,
  label,
  onPress,
  onLongPress,
  isActiveTab,
  isPulsing = false,
  pulseStart = null,
}: TabButtonProps) {
  const { isReducedMotion } = useReducedMotion();
  const bounce = useSharedValue(1);
  const iconScale = useSharedValue(focused ? 1.08 : 1);
  const pillProgress = useSharedValue(focused ? 1 : 0);
  const pulseScale = useSharedValue(1);
  const iconName = getRouteIcon(route.name);
  const labelText = label;

  // Pulse animation for streak at risk
  useEffect(() => {
    if (isPulsing && pulseStart !== null && !isReducedMotion) {
      const elapsed = Date.now() - pulseStart;
      // Pulse every 2 seconds
      const pulseInterval = setInterval(() => {
        pulseScale.value = withSequence(
          withTiming(1.15, { duration: 300 }),
          withTiming(1, { duration: 300 }),
        );
      }, 2000);
      return () => clearInterval(pulseInterval);
    }
    return undefined;
  }, [isPulsing, pulseStart, isReducedMotion, pulseScale]);

  useEffect(() => {
    if (isReducedMotion) {
      iconScale.value = focused ? 1.08 : 1;
      pillProgress.value = focused ? 1 : 0;
      return;
    }
    iconScale.value = withSpring(focused ? 1.08 : 1, springPresets.settle);
    pillProgress.value = withSpring(focused ? 1 : 0, springPresets.precise);
  }, [focused, isReducedMotion, iconScale, pillProgress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isActiveTab ? iconScale.value : bounce.value },
      { scale: pulseScale.value },
    ],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillProgress.value,
    transform: [{ scale: 0.9 + pillProgress.value * 0.1 }],
  }));

  const handlePress = (): void => {
    tabSwitch();
    if (!isReducedMotion) {
      bounce.value = withSequence(
        withTiming(0.88, { duration: timingPresets.microFade.duration }),
        withSpring(1, springPresets.tactile),
      );
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityHint={`Navigate to ${labelText}`}
      accessibilityLabel={`${labelText} tab`}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={handlePress}
      style={{ flex: 1, ...getMinTouchTargetStyle() }}
    >
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActiveTabPill height={34} pillStyle={pillStyle} />
        <View
          style={{
            alignItems: 'center',
            gap: 3,
            justifyContent: 'center',
            minWidth: 58,
            paddingHorizontal: 10,
            paddingVertical: 6,
            zIndex: 1,
          }}
        >
          <Animated.View style={iconStyle}>
            <Icon
              color={color}
              name={iconName}
              size="md"
              strokeWidth="thin"
              variant={focused ? 'solid' : 'outline'}
            />
          </Animated.View>
          <Text
            style={{
              color: focused ? vexLightGlass.mint[700] : vexLightGlass.text.disabled,
              fontSize: 12,
              fontWeight: focused ? '800' : '500',
              letterSpacing: 0,
            }}
          >
            {labelText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
