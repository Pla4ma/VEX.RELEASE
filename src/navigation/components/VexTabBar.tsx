import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store';
import { useStreakSummary } from '../../features/streaks/hooks';
import { rgbaColors } from '../../theme/tokens/rgba-colors';
import { TabButton } from './TabButton';

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
      style={{
        borderColor: rgbaColors.rgb_255_255_255_0_12,
        borderRadius: theme.borderRadius['2xl'],
        borderWidth: theme.spacing[0] + 1,
        flexDirection: 'row',
        height: theme.spacing[16] + theme.spacing[2] + insets.bottom,
        marginBottom: Math.max(insets.bottom - theme.spacing[1], theme.spacing[2]),
        marginHorizontal: theme.spacing[4],
        overflow: 'hidden',
        paddingBottom: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
        shadowColor: theme.colors.semantic.shadow,
        shadowOffset: { width: 0, height: theme.spacing[3] },
        shadowOpacity: theme.opacity[20],
        shadowRadius: theme.spacing[6],
      }}
    >
      <LinearGradient
        colors={[
          rgbaColors.rgb_255_255_255_0_18,
          theme.colors.semantic.surfaceGlass,
          rgbaColors.rgb_0_0_0_0_14,
        ]}
        locations={[0, 0.52, 1]}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused
          ? theme.colors.semantic.vexCyan
          : theme.colors.semantic.tabInactive;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
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
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
            onPress={onPress}
            route={route}
          />
        );
      })}
    </View>
  );
}

export default VexTabBar;
