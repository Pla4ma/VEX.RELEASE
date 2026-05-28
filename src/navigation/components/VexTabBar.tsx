import React from "react";
import { View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme";
import { useAuthStore } from "../../store";
import { useStreakSummary } from "../../features/streaks/hooks";
import { createSheet } from "../../shared/ui/create-sheet";
import { TabButton } from "./TabButton";

export function VexTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((store) => store.user?.id ?? null);
  useStreakSummary(userId);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.semantic.surfaceGlass,
          borderColor: theme.colors.semantic.border,
          elevation: 14,
          height: 70 + insets.bottom,
          marginBottom: Math.max(insets.bottom - 4, 8),
          marginHorizontal: 14,
          paddingBottom: 8,
          shadowColor: theme.colors.semantic.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.24,
          shadowRadius: 24,
        },
      ]}
    >
      {state.routes.map((route) => {
        const focused =
          state.index === state.routes.findIndex((r) => r.key === route.key);
        const color = focused
          ? theme.colors.semantic.tabActive
          : theme.colors.semantic.tabInactive;
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
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
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
            onPress={onPress}
            route={route}
          />
        );
      })}
    </View>
  );
}

const styles = createSheet({
  container: {
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
  },
});

export default VexTabBar;
