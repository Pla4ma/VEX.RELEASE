import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { Image } from 'react-native';
import { SkeletonItem } from '../../shared/ui/components/EnhancedSkeleton';
import { vexFire } from '../../theme/tokens/vex-fire';

export function StreakFuneralFlame({ isPending }: { isPending?: boolean }): React.JSX.Element {
  const flameScale = useSharedValue(1);
  const flameOpacity = useSharedValue(1);

  React.useEffect(() => {
    flameScale.value = withSequence(
      withTiming(0.9, { duration: 500 }),
      withTiming(0.7, { duration: 500 }),
      withTiming(0.4, { duration: 500 }),
      withTiming(0, { duration: 500 }),
    );
    flameOpacity.value = withSequence(
      withTiming(0.8, { duration: 500 }),
      withTiming(0.6, { duration: 500 }),
      withTiming(0.3, { duration: 500 }),
      withTiming(0, { duration: 500 }),
    );
  }, [flameOpacity, flameScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity: flameOpacity.value,
  }));

  if (isPending) {
    return <SkeletonItem variant="circle" width={96} height={96} />;
  }

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${vexFire.danger}18`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../../assets/vex/recovery/comeback-phoenix.png')}
          resizeMode="contain"
          style={{ height: 76, width: 76 }}
        />
      </View>
    </Animated.View>
  );
}
