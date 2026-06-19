/**
 * Skeleton List Component
 *
 * List-shaped skeleton loader for repeating content placeholders.
 */
import React from 'react';
import { View } from 'react-native';
import { skeletonStyles } from './Skeleton.styles';
import { Skeleton } from './Skeleton';

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
