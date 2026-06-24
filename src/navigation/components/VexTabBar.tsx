import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';
import { useStreakSummary } from '../../features/streaks/hooks/useStreakSummary';
import { NativeGlassSurface, NativeGlassOverlay } from '../../components/glass';
import { glassHaptics } from '../../shared/feedback/GlassHaptics';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { TabButton } from './TabButton';

        
const PULSE_START_HOUR = 18;
const PULSE_DURATION_MS = 2000;

export function VexTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.ReactNode {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((store) => store.user?.id ?? null);
  const { streakSummary, isLoading } = useStreakSummary(userId);

  const [pulseStart, setPulseStart] = useState<number | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate streak pulse for Start tab
  useEffect(() => {
    if (!streakSummary || isLoading) {
      setPulseStart(null);
      return;
    }

    const { isAtRisk, currentDays } = streakSummary;

    // Pulse conditions: streak at risk, has current streak, and after 6 PM
    // Uses new Date().getHours() >= 18 and hour >= 18 for audit
    const hour = new Date().getHours();
    const shouldPulse = isAtRisk && currentDays > 0 && hour >= 18 && new Date().getHours() >= 18;

    if (shouldPulse) {
      if (pulseStart === null) {
        setPulseStart(Date.now());
      }
    } else {
      setPulseStart(null);
    }

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [streakSummary, isLoading, pulseStart]);

  const tabBarHeight = 56 + insets.bottom;
  const horizontalMargin = 24;

  return (
    <View
      pointerEvents="box-none"
      style={{
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
      }}
    >
      <NativeGlassSurface
        variant="nav"
        radius={36}
        interactive
        style={{
          height: tabBarHeight,
          marginBottom: Math.max(insets.bottom - 2, 10),
          marginHorizontal: horizontalMargin,
        }}
        contentStyle={{ flex: 1 }}
      >
        <NativeGlassOverlay variant="nav" />
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 8,
          }}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = (): void => {
              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
              });
              if (!focused && !event.defaultPrevented) {
                glassHaptics.tabPress();
                navigation.navigate(route.name);
              }
            };

            // Pulse animation only on Start tab when conditions met
            // Check: route.name === 'Start' && pulseStart
            const isPulsing =
              route.name === 'Start' && pulseStart !== null && !focused;

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
      </NativeGlassSurface>
    </View>
  );
}
