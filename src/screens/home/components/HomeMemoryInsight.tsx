import React from 'react';
import { View } from 'react-native';
import { useMemoryPanel } from '../../../features/focus-memory/useMemoryPanel';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import { SkeletonItem } from '../../../shared/ui/components/SkeletonItem';

interface HomeMemoryInsightProps {
  userId: string;
  surfaceMap: HomeSurfaceMap;
}

export function HomeMemoryInsight({
  userId,
  surfaceMap,
}: HomeMemoryInsightProps) {
  const isVisible =
    (surfaceMap as Record<string, string>).memory_insight !== 'hidden' &&
    (surfaceMap as Record<string, string>).memory_insight !== 'blocked';

  const { data, isPending, hideMemory, acceptMemory } = useMemoryPanel(userId);

  if (!isVisible) {return null;}
  if (isPending) {return <SkeletonItem height={80} borderRadius={12} style={{ margin: 16 }} />;}
  if (data.items.length === 0) {return null;}

  return (
    <View style={{ padding: 16 }}>
      {data.items.map((item: unknown, i: number) => (
        <View key={i} style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
          {String(item)}
        </View>
      ))}
    </View>
  );
}
