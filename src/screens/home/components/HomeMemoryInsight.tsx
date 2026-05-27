import React from 'react';
import { useMemoryPanel, MemoryPanel } from '../../../features/focus-memory';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';

interface HomeMemoryInsightProps {
  userId: string;
  surfaceMap: HomeSurfaceMap;
}

export function HomeMemoryInsight({ userId, surfaceMap }: HomeMemoryInsightProps) {
  const isVisible = (surfaceMap as Record<string, string>).memory_insight !== 'hidden'
    && (surfaceMap as Record<string, string>).memory_insight !== 'blocked';

  const { data, isPending, hideMemory, acceptMemory } = useMemoryPanel(userId);

  if (!isVisible || isPending) return null;
  if (data.items.length === 0) return null;

  return (
    <MemoryPanel
      items={data.items}
      onHide={hideMemory}
      onAccept={acceptMemory}
    />
  );
}
