import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';
import { useStreakSummary } from '../../features/streaks/hooks';
import { GlassBlurLayer } from '../../components/glass/GlassBlurLayer';
import { TabButton } from './TabButton';

export function VexTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((store) => store.user?.id ?? null);
  useStreakSummary(userId);

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
      <View
        style={{
          borderRadius: 36,
          elevation: 6,
          height: tabBarHeight,
          marginBottom: Math.max(insets.bottom - 2, 10),
          marginHorizontal: horizontalMargin,
          overflow: 'hidden',
          shadowColor: 'rgba(80, 100, 95, 0.14)',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.85,
          shadowRadius: 18,
        }}
      >
        <GlassBlurLayer intensity={82} radius={36} />
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.68)',
            borderColor: 'rgba(255, 255, 255, 0.78)',
            borderRadius: 36,
            borderWidth: 1.2,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.32)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            height: '55%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        {/* Top glass edge highlight - thin white line */}
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            height: 1.5,
            left: 28,
            position: 'absolute',
            right: 28,
            top: 1.2,
          }}
        />
        {/* Secondary glass edge highlight */}
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            height: 1,
            left: 32,
            position: 'absolute',
            right: 32,
            top: 3,
          }}
        />
        {/* Bottom glass edge shadow */}
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(10, 94, 77, 0.06)',
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            bottom: 1.2,
            height: 1.2,
            left: 24,
            position: 'absolute',
            right: 24,
          }}
        />
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
                navigation.navigate(route.name);
              }
            };
            return (
              <TabButton
                color={focused ? vexLightGlass.mint[700] : vexLightGlass.text.tertiary}
                focused={focused}
                isActiveTab={focused}
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
      </View>
    </View>
  );
}

export default VexTabBar;
