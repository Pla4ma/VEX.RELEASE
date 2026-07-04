import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { SkeletonItem } from './SkeletonItem';

export interface SkeletonLayoutProps {
  type: 'card' | 'list' | 'hero' | 'stats' | 'text-block';
  count?: number;
  style?: ViewStyle;
}

export const CardSkeleton: React.ComponentType<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          gap: theme.spacing[3],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing[3],
          alignItems: 'center',
        }}
      >
        <SkeletonItem variant="avatar" />
        <View style={{ flex: 1, gap: theme.spacing[2] }}>
          <SkeletonItem variant="title" width="60%" />
          <SkeletonItem variant="text" width="40%" />
        </View>
      </View>
      <SkeletonItem variant="text" width="90%" />
      <SkeletonItem variant="text" width="75%" />
    </View>
  );
};

export const HeroSkeleton: React.ComponentType<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius['2xl'],
          padding: theme.spacing[5],
          gap: theme.spacing[4],
        },
        style,
      ]}
    >
      <SkeletonItem variant="title" width="50%" height={32} />
      <SkeletonItem variant="text" width="80%" />
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing[4],
          marginTop: theme.spacing[2],
        }}
      >
        <SkeletonItem variant="circle" width={80} height={80} />
        <View
          style={{ flex: 1, justifyContent: 'center', gap: theme.spacing[2] }}
        >
          <SkeletonItem variant="text" width="60%" />
          <SkeletonItem variant="text" width="40%" />
        </View>
      </View>
    </View>
  );
};

export const ListSkeleton: React.ComponentType<{ count?: number; style?: ViewStyle }> = ({
  count = 3,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View style={[{ gap: theme.spacing[3] }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={`item-${index}`} />
      ))}
    </View>
  );
};

export const StatsSkeleton: React.ComponentType<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: theme.spacing[3] }, style]}>
      {[1, 2, 3].map((i) => (
        <View
          key={`item-${i}`}
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing[4],
            gap: theme.spacing[2],
          }}
        >
          <SkeletonItem variant="text" width="80%" />
          <SkeletonItem variant="title" width="60%" height={28} />
        </View>
      ))}
    </View>
  );
};

export const TextBlockSkeleton: React.ComponentType<{
  lines?: number;
  style?: ViewStyle;
}> = ({ lines = 4, style }) => {
  const { theme } = useTheme();
  return (
    <View style={[{ gap: theme.spacing[2] }, style]}>
      <SkeletonItem variant="title" width="70%" />
      {Array.from({ length: lines - 1 }).map((_, index) => (
        <SkeletonItem
          key={`item-${index}`}
          variant="text"
          width={index === lines - 2 ? '50%' : '100%'}
        />
      ))}
    </View>
  );
};

export const EnhancedSkeleton: React.ComponentType<SkeletonLayoutProps> = ({
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

export const ScreenLoadingState: React.ComponentType<{
  hero?: boolean;
  stats?: boolean;
  cards?: number;
  style?: ViewStyle;
}> = ({ hero = true, stats = true, cards = 2, style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        { flex: 1, padding: theme.spacing[5], gap: theme.spacing[4] },
        style,
      ]}
    >
      {hero && <HeroSkeleton />}
      {stats && <StatsSkeleton />}
      {cards > 0 && <ListSkeleton count={cards} />}
    </View>
  );
};
