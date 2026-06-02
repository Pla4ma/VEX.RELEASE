import React, { useEffect } from 'react';
import { Platform, Pressable, View } from 'react-native';
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
import { tabSwitch } from '../../utils/haptics';
import { createSheet } from '../../shared/ui/create-sheet';

const ICONS = {
  Home: 'home',
  Focus: 'target',
  Progress: 'chart',
  Profile: 'user',
} as const;

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
  const bounce = useSharedValue(1);
  const labelProgress = useSharedValue(focused ? 1 : 0);
  const iconScale = useSharedValue(focused ? 1.15 : 1);

  useEffect(() => {
    labelProgress.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
    iconScale.value = withSpring(focused ? 1.15 : 1, {
      damping: 12,
      stiffness: 150,
    });
  }, [focused, labelProgress, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isActiveTab ? iconScale.value : bounce.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
    transform: [{ translateY: (1 - labelProgress.value) * -6 }],
  }));
  const indicatorWidth = useSharedValue(focused ? 24 : 14);
  const indicatorOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    indicatorWidth.value = withSpring(focused ? 24 : 14, {
      damping: 15,
      stiffness: 200,
    });
    indicatorOpacity.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused, indicatorWidth, indicatorOpacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    opacity: indicatorOpacity.value,
  }));

  const handlePress = () => {
    tabSwitch();
    bounce.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    onPress();
  };

  if (Platform.OS === 'web') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onLongPress={onLongPress}
        onPress={handlePress}
        style={styles.pressable}
        accessibilityLabel={`${label} tab`}
        accessibilityHint={`Navigate to ${label}`}
      >
        <View style={styles.item}>
          <View style={styles.iconShell}>
            <Icon
              color={color}
              name={ICONS[route.name as keyof typeof ICONS]}
              size={24}
              variant={focused ? 'solid' : 'outline'}
            />
          </View>
          <Text
            color={focused ? theme.colors.semantic.vexCyan : theme.colors.text.tertiary}
            style={styles.label}
            variant="caption"
          >
            {label}
          </Text>
          <View
            style={[
              styles.indicator,
              { backgroundColor: theme.colors.semantic.vexCyan, width: focused ? 24 : 14, opacity: focused ? 1 : 0 },
            ]}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={handlePress}
      style={styles.pressable}
      accessibilityLabel={`${label} tab`}
      accessibilityHint={`Navigate to ${label}`}
    >
      <View style={styles.item}>
        <View style={styles.iconShell}>
          <Animated.View style={iconStyle}>
            <Icon
              color={color}
              name={ICONS[route.name as keyof typeof ICONS]}
              size={24}
              variant={focused ? 'solid' : 'outline'}
            />
          </Animated.View>
        </View>
        <Animated.View style={labelStyle}>
          <Text
            color={
              focused ? theme.colors.semantic.vexCyan : theme.colors.text.tertiary
            }
            style={styles.label}
            variant="caption"
          >
            {label}
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: theme.colors.semantic.vexCyan },
            indicatorStyle,
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = createSheet({
  pressable: { flex: 1 },
  item: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconShell: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
    position: 'relative',
  },
  label: { marginTop: 4 },
  indicator: { borderRadius: 999, height: 3, marginTop: 4, width: 14 },
});
