import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { TabButton } from './TabButton';
import { useTabBarPulse } from './useTabBarPulse';
import { TabBarBackground } from './TabBarBackground';

export function VexTabBar({ state, descriptors, navigation }: BottomTabBarProps): React.ReactElement {
  const userId = useAuthStore((store) => store.user?.id ?? null);
  const { pulseStart } = useTabBarPulse(userId);

  const tabBarHeight = 56;
  const horizontalMargin = 24;

  return (
    <TabBarBackground tabBarHeight={tabBarHeight} horizontalMargin={horizontalMargin}>
      <View style={{ alignItems: 'center', flex: 1, flexDirection: 'row', paddingHorizontal: 8 }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = (): void => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Pulse animation only on Start tab when conditions met
          // Check: route.name === 'Start' && pulseStart
          const isPulsing = route.name === 'Start' && pulseStart !== null && !focused;

          return (
            <TabButton
              color={focused ? vexLightGlass.mint[700] : vexLightGlass.text.tertiary}
              focused={focused}
              isActiveTab={focused}
              isPulsing={isPulsing}
              pulseStart={pulseStart}
              key={route.key}
              label={descriptors[route.key]?.options.title ?? route.name}
              onLongPress={() =>
                navigation.emit({ target: route.key, type: 'tabLongPress' })
              }
              onPress={onPress}
              route={route}
            />
          );
        })}
      </View>
    </TabBarBackground>
  );
}

export default VexTabBar;