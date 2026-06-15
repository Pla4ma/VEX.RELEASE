import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
    <GlassCard
      padding={16}
      radius={22}
      style={{ flex: 1 }}
      variant="default"
    >
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={32} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 6,
          bottom: 6,
          zIndex: 0,
        }}
      >
        <WaterBubble size={16} opacity={0.65} />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: -0.2,
        }}
      >
        Focus Score
      </Text>
      <View
        style={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          gap: 8,
          marginTop: 8,
        }}
      >
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 24,
            fontWeight: '800',
            letterSpacing: -0.8,
          }}
        >
          {score}
        </Text>
        <Text
          style={{
            color: vexLightGlass.mint[500],
            fontSize: 13,
            fontWeight: '800',
            marginBottom: 4,
          }}
        >
          {delta}
        </Text>
      </View>
      <Text
        style={{
          color: vexLightGlass.mint[500],
          fontSize: 12,
          fontWeight: '800',
          marginTop: 3,
        }}
      >
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
    <GlassCard
      padding={16}
      radius={22}
      style={{ flex: 1 }}
      variant="default"
    >
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" intensity={0.48} size={24} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 6,
          bottom: 6,
          zIndex: 0,
        }}
      >
        <WaterBubble size={14} opacity={0.65} />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: -0.2,
        }}
      >
        Focus Memory
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          lineHeight: 17,
          marginTop: 8,
          fontWeight: '400',
        }}
      >
        {memoryText}
      </Text>
    </GlassCard>
  );
}
