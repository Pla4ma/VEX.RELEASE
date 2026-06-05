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
import { Icon } from '../../icons';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { tabSwitch } from '../../utils/haptics';
import { springPresets, timingPresets } from '../../theme/tokens/motion';

const ICONS = {
  Home: 'home',
  Focus: 'target',
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
}

export function TabButton({
  route,
  focused,
  color,
  label,
  onPress,
  onLongPress,
  isActiveTab,
}: TabButtonProps) {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const bounce = useSharedValue(1);
  const labelProgress = useSharedValue(focused ? 1 : 0);
  const iconScale = useSharedValue(focused ? 1.12 : 1);
  const iconName = getRouteIcon(route.name);

  useEffect(() => {
    if (isReducedMotion) {
      labelProgress.value = focused ? 1 : 0;
      iconScale.value = focused ? 1.12 : 1;
      return;
    }
    labelProgress.value = withSpring(focused ? 1 : 0, springPresets.precise);
    iconScale.value = withSpring(focused ? 1.12 : 1, springPresets.settle);
  }, [focused, isReducedMotion, labelProgress, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isActiveTab ? iconScale.value : bounce.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
    transform: [
      { translateY: (1 - labelProgress.value) * -theme.spacing[2] },
    ],
  }));
  const indicatorWidth = useSharedValue(
    focused ? theme.spacing[6] : theme.spacing[4],
  );
  const indicatorOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {
      indicatorWidth.value = focused ? theme.spacing[6] : theme.spacing[4];
      indicatorOpacity.value = focused ? 1 : 0;
      return;
    }
    indicatorWidth.value = withSpring(
      focused ? theme.spacing[6] : theme.spacing[4],
      springPresets.precise,
    );
    indicatorOpacity.value = withSpring(focused ? 1 : 0, springPresets.precise);
  }, [focused, indicatorWidth, indicatorOpacity, isReducedMotion, theme.spacing]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    opacity: indicatorOpacity.value,
  }));

  const handlePress = () => {
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
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={handlePress}
      style={{ flex: 1 }}
      accessibilityLabel={`${label} tab`}
      accessibilityHint={`Navigate to ${label}`}
    >
      <View
        style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={iconStyle}>
            <Icon
              color={color}
              name={iconName}
              size="lg"
              variant={focused ? 'solid' : 'outline'}
            />
          </Animated.View>
        </View>
        <Animated.View style={labelStyle}>
          <Text
            color={
              focused ? theme.colors.semantic.vexCyan : theme.colors.text.tertiary
            }
            style={{ marginTop: theme.spacing[1] }}
            variant="caption"
          >
            {label}
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            {
              borderRadius: theme.borderRadius.full,
              height: theme.spacing[1],
              marginTop: theme.spacing[1],
            },
            {
              backgroundColor: theme.colors.semantic.vexCyan,
              shadowColor: theme.colors.semantic.vexCyan,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: theme.opacity[40],
              shadowRadius: theme.spacing[3],
            },
            indicatorStyle,
          ]}
        />
      </View>
    </Pressable>
  );
}
