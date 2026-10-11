import React, { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../components/primitives/Text';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { tabSwitch } from '../../utils/haptics';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { springPresets, timingPresets } from '../../theme/tokens/motion';
import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '../../theme/tokens/vex-fire';

const NAV_ICON_ASSETS: Record<string, number> = {
  Home: require('../../../assets/vex/nav-home-fire.png'),
  Focus: require('../../../assets/vex/nav-focus-fire.png'),
  Progress: require('../../../assets/vex/nav-progress-fire.png'),
  Profile: require('../../../assets/vex/nav-profile-fire.png'),
};

export interface TabButtonProps {
  route: BottomTabBarProps['state']['routes'][number];
  focused: boolean;
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
  label,
  onPress,
  onLongPress,
  isActiveTab,
  isPulsing = false,
  pulseStart = null,
}: TabButtonProps): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const { theme } = useTheme();
  const bounce = useSharedValue(1);
  const iconScale = useSharedValue(focused ? 1.05 : 1);
  const pulseScale = useSharedValue(1);
  const iconAsset = NAV_ICON_ASSETS[route.name] ?? NAV_ICON_ASSETS.Home;

  useEffect(() => {
    if (isPulsing && pulseStart !== null && !isReducedMotion) {
      const pulseInterval = setInterval(() => {
        pulseScale.value = withSequence(
          withTiming(1.1, { duration: 240 }),
          withTiming(1, { duration: 240 }),
        );
      }, 2400);
      return () => clearInterval(pulseInterval);
    }
    return undefined;
  }, [isPulsing, pulseStart, isReducedMotion, pulseScale]);

  useEffect(() => {
    if (isReducedMotion) {
      iconScale.value = focused ? 1.05 : 1;
      return;
    }
    iconScale.value = withSpring(focused ? 1.05 : 1, springPresets.settle);
  }, [focused, isReducedMotion, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isActiveTab ? iconScale.value : bounce.value },
      { scale: pulseScale.value },
    ],
  }));

  const handlePress = (): void => {
    tabSwitch();
    if (!isReducedMotion) {
      bounce.value = withSequence(
        withTiming(0.92, { duration: timingPresets.microFade.duration }),
        withSpring(1, springPresets.tactile),
      );
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityHint={`Navigate to ${label}`}
      accessibilityLabel={`${label} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={handlePress}
      style={({ pressed }) => [
        { flex: 1, ...getMinTouchTargetStyle() },
        pressed ? { opacity: 0.72 } : undefined,
      ]}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'transparent',
          flex: 1,
          justifyContent: 'center',
          minHeight: 48,
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[1],
          rowGap: theme.spacing[1],
        }}
      >
        <Animated.View style={iconStyle}>
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel={`${label} icon`}
            source={iconAsset}
            style={{
              height: focused ? theme.spacing[8] : theme.spacing[6],
              opacity: focused ? theme.opacity[100] : theme.opacity[70],
              width: focused ? theme.spacing[8] : theme.spacing[6],
            }}
          />
        </Animated.View>
        <Text
          style={{
            color: focused ? vexFire.cream : vexFire.textMuted,
            fontSize: theme.typography.ui.caption.fontSize,
            fontWeight: focused ? theme.fontWeights.bold : theme.fontWeights.medium,
          }}
      >
        {label}
      </Text>
        <View
          style={{
            backgroundColor: focused ? vexFire.ember : 'transparent',
            borderRadius: theme.borderRadius.full,
            height: theme.spacing[1],
            marginTop: theme.spacing[1],
            width: focused ? theme.spacing[1] : 0,
          }}
        />
      </View>
    </Pressable>
  );
}
