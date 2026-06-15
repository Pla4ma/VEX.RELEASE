import React from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Skeleton } from '../components/ui/Skeleton';

interface RootAuthLoadingScreenProps {
  background: string;
  primary: string;
}

export function RootAuthLoadingScreen({
  background,
  primary,
}: RootAuthLoadingScreenProps): React.ReactNode {
  const pulse = useSharedValue(0.3);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const brandMarkStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: background,
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Animated.View style={brandMarkStyle}>
          <View
            style={{
              backgroundColor: primary,
              borderRadius: 20,
              height: 64,
              width: 64,
            }}
          />
        </Animated.View>

        <View
          style={{
            alignItems: 'center',
            gap: 12,
            width: 200,
          }}
        >
          <Skeleton width="100%" height={16} />
          <Skeleton width="70%" height={12} />
        </View>
      </View>

      <View
        style={{
          bottom: 32,
          gap: 16,
          left: 0,
          paddingHorizontal: 20,
          position: 'absolute',
          right: 0,
        }}
      >
        <Skeleton height={80} variant="rounded" />
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Skeleton height={48} variant="rounded" />
          </View>
          <View style={{ flex: 1 }}>
            <Skeleton height={48} variant="rounded" />
          </View>
        </View>
      </View>
    </View>
  );
}
