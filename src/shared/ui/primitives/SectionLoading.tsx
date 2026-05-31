import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Skeleton, SkeletonCard, SkeletonList } from './Skeleton';
import { sectionStyles as styles } from './loadingOverlay.styles';

interface SectionLoadingProps {
  type?: 'text' | 'card' | 'chart' | 'list';
  count?: number;
  style?: ViewStyle;
}

export function SectionLoading({
  type = 'card',
  count = 3,
  style,
}: SectionLoadingProps) {
  switch (type) {
    case 'text':
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton lines={count} height={16} spacing={8} />
        </View>
      );
    case 'card':
      return (
        <View style={[styles.sectionContainer, style]}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} style={styles.sectionItem} />
          ))}
        </View>
      );
    case 'chart':
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton variant="rounded" height={200} />
        </View>
      );
    case 'list':
      return (
        <View style={[styles.sectionContainer, style]}>
          <SkeletonList count={count} />
        </View>
      );
    default:
      return null;
  }
}
