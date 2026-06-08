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
          borderRadius: 30,
          elevation: 6,
          height: 58,
          marginBottom: Math.max(insets.bottom + 10, 18),
          marginHorizontal: 16,
          overflow: 'hidden',
          shadowColor: 'rgba(13, 76, 65, 0.14)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
        }}
      >
        <GlassBlurLayer intensity={80} radius={30} />
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.68)',
            borderColor: 'rgba(255, 255, 255, 0.82)',
            borderRadius: 30,
            borderWidth: 1,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.28)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: '55%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
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
                color={focused ? '#0C765F' : 'rgba(16, 35, 31, 0.42)'}
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
