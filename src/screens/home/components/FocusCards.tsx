import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { Text } from '../../../components/primitives/Text';

interface FocusScoreCardProps {
  score?: number;
  delta?: string;
  status?: string;
}

export function FocusScoreCard({
  score = 82,
  delta = '+6',
  status = 'Stable',
}: FocusScoreCardProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={22} style={{ flex: 1 }} variant="default">
      <View pointerEvents="none" style={{ opacity: 0.85, position: 'absolute', right: 8, top: 8, zIndex: 0 }}>
        <FloatingDroplets count={3} opacity={0.65} size={32} />
      </View>
      <View pointerEvents="none" style={{ opacity: 0.85, position: 'absolute', left: 6, bottom: 6, zIndex: 0 }}>
        <WaterBubble size={16} opacity={0.65} />
      </View>
      <Text variant="h4">Focus Score</Text>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Text variant="h2">{score}</Text>
        <Text color="primary.500" variant="label" style={{ marginBottom: 4 }}>
          {delta}
        </Text>
      </View>
      <Text color="secondary.500" variant="label" style={{ marginTop: 3 }}>
        {status}
      </Text>
    </GlassCard>
  );
}

interface FocusMemoryCardProps {
  memoryText?: string;
}

export function FocusMemoryCard({
  memoryText = 'VEX remembered your next move.',
}: FocusMemoryCardProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={22} style={{ flex: 1 }} variant="default">
      <View pointerEvents="none" style={{ opacity: 0.85, position: 'absolute', right: 8, top: 8, zIndex: 0 }}>
        <LiquidGlassSphere color="pearl" intensity={0.48} size={24} />
      </View>
      <View pointerEvents="none" style={{ opacity: 0.85, position: 'absolute', left: 6, bottom: 6, zIndex: 0 }}>
        <WaterBubble size={14} opacity={0.65} />
      </View>
      <Text variant="h4">Focus Memory</Text>
      <Text color="text.secondary" variant="bodySmall" style={{ marginTop: 8 }}>
        {memoryText}
      </Text>
    </GlassCard>
  );
}
