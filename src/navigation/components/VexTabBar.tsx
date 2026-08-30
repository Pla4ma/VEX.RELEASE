import React from 'react';
import { View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { glassHaptics } from '../../shared/feedback/GlassHaptics';
import { TabButton } from './TabButton';

export function VexTabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: 0,
        left: 0,
        paddingBottom: insets.bottom + theme.spacing[1],
        paddingHorizontal: theme.spacing[1],
        position: 'absolute',
        right: 0,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.primary[800],
          borderTopWidth: 1,
          flexDirection: 'row',
          minHeight: theme.spacing[16],
          paddingHorizontal: theme.spacing[1],
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = (): void => {
            const event = navigation.emit({ canPreventDefault: true, target: route.key, type: 'tabPress' });
            if (!focused && !event.defaultPrevented) {
              glassHaptics.tabPress();
              navigation.navigate(route.name);
            }
          };
          return (
            <TabButton
              focused={focused}
              isActiveTab={focused}
              key={route.key}
              label={descriptors[route.key]?.options.title ?? route.name}
              onLongPress={() => navigation.emit({ target: route.key, type: 'tabLongPress' })}
              onPress={onPress}
              route={route}
            />
          );
        })}
      </View>
    </View>
  );
}
