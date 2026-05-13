import React, { useMemo } from "react";
import { View, ViewStyle, DimensionValue } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from "react-native-reanimated";
import { useTheme } from "../../../theme";


export const TextBlockSkeleton: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 4,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[{ gap: theme.spacing[2] }, style]}>
      <SkeletonItem variant="title" width="70%" />
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <SkeletonItem
          key={index}
          variant="text"
          width={index === lines - 2 ? '50%' : '100%'}
        />
      ))}
    </View>
  );
};

export const EnhancedSkeleton: React.FC<SkeletonLayoutProps> = ({
  type,
  count = 3,
  style,
}) => {
  switch (type) {
    case 'card':
      return <CardSkeleton style={style} />;
    case 'list':
      return <ListSkeleton count={count} style={style} />;
    case 'hero':
      return <HeroSkeleton style={style} />;
    case 'stats':
      return <StatsSkeleton style={style} />;
    case 'text-block':
      return <TextBlockSkeleton lines={count} style={style} />;
    default:
      return <CardSkeleton style={style} />;
  }
};

export const ScreenLoadingState: React.FC<{
  hero?: boolean;
  stats?: boolean;
  cards?: number;
  style?: ViewStyle;
}> = ({ hero = true, stats = true, cards = 2, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[{ flex: 1, padding: theme.spacing[5], gap: theme.spacing[4] }, style]}>
      {hero && <HeroSkeleton />}
      {stats && <StatsSkeleton />}
      {cards > 0 && <ListSkeleton count={cards} />}
    </View>
  );
};