import React from 'react';
import { View } from 'react-native';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { PersonalBest } from '../../../features/personal-bests/types';

function formatMode(mode: string): string {
  return mode
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function formatDuration(bucket: PersonalBest['durationBucket']): string {
  return bucket === '60+' ? '60+ min' : `${bucket} min`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface PersonalBestCardProps {
  item: PersonalBest;
}

export function PersonalBestCard({ item }: PersonalBestCardProps): React.ReactNode {
  const label = `${formatMode(item.sessionMode)} ${formatDuration(item.durationBucket)}, ${Math.round(item.bestPurityScore)} purity, grade ${item.bestGrade}`;
  return (
    <View style={{ marginBottom: 10 }}>
      <GlassCard
        accessibilityLabel={label}
        size="md"
        padding={14}
        radius={20}
        variant="default"
      >
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 6,
            top: 6,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={2} opacity={0.65} size={20} />
        </View>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box flex={1}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              {formatMode(item.sessionMode)}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {`${formatDuration(item.durationBucket)} · Set ${formatDate(item.achievedAt)}`}
            </Text>
          </Box>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <GlassPill
              label={`Grade ${item.bestGrade}`}
              variant="premium"
              size="sm"
            />
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {`${Math.round(item.bestPurityScore)} purity`}
            </Text>
          </View>
        </Box>
      </GlassCard>
    </View>
  );
}
