import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store';
import { useStreakSummary } from '../../features/streaks/hooks';
import { TabButton } from './TabButton';

export function VexTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((store) => store.user?.id ?? null);
  useStreakSummary(userId);

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
          borderRadius: 28,
          elevation: 10,
          height: 64,
          marginBottom: Math.max(insets.bottom - 2, 8),
          marginHorizontal: 16,
          overflow: 'hidden',
          shadowColor: 'rgba(13, 76, 65, 0.18)',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.20,
          shadowRadius: 22,
        }}
      >
        <BlurView
          intensity={44}
          pointerEvents="none"
          tint="light"
          style={{
            borderRadius: 28,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.58)',
            borderColor: 'rgba(255, 255, 255, 0.88)',
            borderRadius: 28,
            borderWidth: 1,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.82)', 'rgba(255, 255, 255, 0.16)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: '62%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: 1,
            left: 28,
            position: 'absolute',
            right: 28,
            top: 1,
          }}
        />
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 6,
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
                color={focused ? '#0C765F' : 'rgba(16, 35, 31, 0.48)'}
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
