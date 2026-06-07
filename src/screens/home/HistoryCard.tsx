import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassPill } from '../../components/glass/GlassPill';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { SessionHistoryEntry } from '../../session/types';

export function HistoryCard({ entry }: { entry: SessionHistoryEntry }) {
  const minutes = Math.max(
    1,
    Math.round((entry.summary?.actualDuration ?? entry.config.duration) / 60),
  );
  return (
    <GlassCard variant="subtle" padding={14} radius={20} size="sm">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 13,
              fontWeight: '700',
            }}
          >
            {entry.config.customName || 'Focus Session'}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 12,
            }}
          >
            {`${minutes} min | ${entry.status.replace('_', ' ')}${entry.summary ? ` | +${entry.summary.xpEarned} XP` : ''}`}
          </Text>
        </View>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 11,
            fontWeight: '600',
          }}
        >
          {entry.endedAt
            ? new Date(entry.endedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'In progress'}
        </Text>
      </View>
    </GlassCard>
  );
}
