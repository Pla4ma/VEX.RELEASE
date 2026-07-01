/**
 * Skeleton Card Component
 *
 * Card-shaped skeleton loader for content placeholders.
 */
import React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { skeletonStyles } from './Skeleton.styles';
import { Skeleton } from './Skeleton';

export const SkeletonCard: React.ComponentType<{ lines?: number; height?: number }> = ({
  lines = 3,
  height: _height = 120,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);
  const animatedOpacityStyle: AnimatedStyle<{ opacity: number }> = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const CardWrapper = Platform.OS === 'web' ? View : Animated.View;
  const cardStyle = Platform.OS === 'web'
    ? { opacity: 0.5 }
    : animatedOpacityStyle;
  return (
    <CardWrapper
      style={[
        skeletonStyles.card,
        { backgroundColor: theme.colors.semantic.surfaceGlass },
        cardStyle,
      ]}
    >
      <View style={skeletonStyles.cardHeader}>
        <Skeleton width={40} height={40} variant="circular" animate={false} />
        <View style={skeletonStyles.cardHeaderText}>
          <Skeleton width={120} height={16} animate={false} />
          <Skeleton width={80} height={12} animate={false} />
        </View>
      </View>
      <View style={skeletonStyles.cardContent}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '80%' : '100%'}
            height={14}
            animate={false}
          />
        ))}
      </View>
    </CardWrapper>
  );
};
