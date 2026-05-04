import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useAuthStore } from '../../store';
import { useStreakSummary } from '../../features/streaks/hooks';
import { createSheet } from '@/shared/ui/create-sheet';

// Launch tab structure: Home / Focus / Progress / Profile
const ICONS = { Home: 'home', Focus: 'target', Progress: 'chart', Profile: 'user' } as const;

interface TabButtonProps {
  route: BottomTabBarProps['state']['routes'][number];
  focused: boolean;
  color: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  isActiveTab: boolean;
}

function TabButton({
  route, focused, color, label, onPress, onLongPress, isActiveTab,
}: TabButtonProps) {
  const { theme } = useTheme();
  const bounce = useSharedValue(1);
  const labelProgress = useSharedValue(focused ? 1 : 0);
  const iconScale = useSharedValue(focused ? 1.15 : 1);

  useEffect(() => {
    labelProgress.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 200 });
    iconScale.value = withSpring(focused ? 1.15 : 1, { damping: 12, stiffness: 150 });
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
    indicatorWidth.value = withSpring(focused ? 24 : 14, { damping: 15, stiffness: 200 });
    indicatorOpacity.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [focused, indicatorWidth, indicatorOpacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    opacity: indicatorOpacity.value,
  }));

  const handlePress = () => {
    bounce.value = withSequence(withTiming(0.85, { duration: 80 }), withSpring(1, { damping: 10, stiffness: 200 }));
    onPress();
  };

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
            color={focused ? theme.colors.text.primary : theme.colors.text.tertiary}
            style={styles.label}
            variant="caption"
          >
            {label}
          </Text>
        </Animated.View>
        <Animated.View style={[styles.indicator, { backgroundColor: theme.colors.primary[500] }, indicatorStyle]} />
      </View>
    </Pressable>
  );
}

export function VexTabBar({ state, descriptors, navigation }: BottomTabBarProps): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((store) => store.user?.id ?? null);
  const streakSummaryQuery = useStreakSummary(userId);
  const hour = new Date().getHours();

  // Pulse Focus tab when streak is at risk in evening
  const pulseFocus = !!streakSummaryQuery.data?.isAtRisk &&
    (streakSummaryQuery.data?.currentDays ?? 0) > 0 &&
    hour >= 18;

  return (
    <View style={[styles.container, {
      backgroundColor: theme.colors.background.secondary,
      borderTopColor: theme.colors.border.light,
      height: 56 + insets.bottom,
      paddingBottom: insets.bottom,
    }]}>
      {state.routes.map((route) => {
        const focused = state.index === state.routes.findIndex(r => r.key === route.key);
        const color = focused ? theme.colors.primary[500] : theme.colors.text.tertiary;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TabButton
            color={color}
            focused={focused}
            isActiveTab={focused}
            key={route.key}
            label={descriptors[route.key]?.options.title ?? route.name}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            onPress={onPress}
            route={route}
          />
        );
      })}
    </View>
  );
}

const styles = createSheet({
  container: { borderTopWidth: 1, flexDirection: 'row', paddingHorizontal: 8 },
  pressable: { flex: 1 },
  item: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingTop: 8 },
  iconShell: { alignItems: 'center', height: 28, justifyContent: 'center', minWidth: 28, position: 'relative' },
  label: { marginTop: 4 },
  indicator: { borderRadius: 1.5, height: 3, marginTop: 4, width: 14 },
});

export default VexTabBar;
