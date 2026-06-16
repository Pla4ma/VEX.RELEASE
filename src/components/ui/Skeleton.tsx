import React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { skeletonStyles } from './Skeleton.styles';
import { SkeletonLines } from './SkeletonLines';

type SkeletonWidth = number | `${number}%` | 'auto';

interface SkeletonProps {
  width?: SkeletonWidth;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  spacing?: number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius,
  variant = 'text',
  lines = 1,
  spacing = 8,
  animate = true,
}) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = animate
      ? withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.3, { duration: 800 }),
          ),
          -1,
          true,
        )
      : 0.3;
  }, [animate, opacity, reducedMotion]);
  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const getBorderRadius = (): number => {
    if (borderRadius !== undefined) {
      return borderRadius;
    }
    switch (variant) {
      case 'circular':
        return height / 2;
      case 'rounded':
        return 8;
      case 'rectangular':
        return 0;
      default:
        return 4;
    }
  };
  const lineStyle: object = Platform.OS === 'web'
    ? { opacity: animate ? 0.5 : 0.3 }
    : animatedOpacityStyle;
  return (
    <View style={skeletonStyles.container}>
      <SkeletonLines
        lines={lines}
        width={width}
        height={height}
        borderRadius={getBorderRadius()}
        spacing={spacing}
        lineStyle={lineStyle}
        backgroundColor={theme.colors.surface.selected}
      />
    </View>
  );
};

export const SkeletonCard: React.FC<{ lines?: number; height?: number }> = ({
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

export const SkeletonList: React.FC<{
  count?: number;
  itemHeight?: number;
}> = ({ count = 5, itemHeight = 72 }) => {
  return (
    <View style={skeletonStyles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[skeletonStyles.listItem, { height: itemHeight }]}>
          <Skeleton width={48} height={48} variant="circular" />
          <View style={skeletonStyles.listItemContent}>
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={12} />
          </View>
          <Skeleton width={60} height={24} variant="rounded" />
        </View>
      ))}
    </View>
  );
};
