import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { SessionHistoryEntry } from '../types';
import { lightColors } from '@/theme/tokens/colors';

import { buttonTap } from '../../utils/haptics';
import {
  formatDuration,
  formatDate,
  getStatusColor,
} from './session-history-helpers';

interface SessionHistoryCardProps {
  entry: SessionHistoryEntry;
  onSelect?: (entry: SessionHistoryEntry) => void;
}

export const SessionHistoryCard: React.FC<SessionHistoryCardProps> = ({
  entry,
  onSelect,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.historyItem, pressed && { opacity: 0.8 }]}
      onPress={() => {
        buttonTap();
        onSelect?.(entry);
      }}
      accessibilityLabel={`Session: ${entry.config.category || 'Focus Session'}, ${entry.summary?.finalScore ?? 0} points`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view session details"
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(entry.status) },
          ]}
        />
        <View>
          <Text style={styles.itemDate}>
            {formatDate(entry.endedAt ?? entry.createdAt)}
          </Text>
          <Text style={styles.itemCategory}>
            {entry.config.category || 'Focus Session'}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        {entry.summary && (
          <>
            <Text style={styles.itemScore}>{entry.summary.finalScore} pts</Text>
            <Text style={styles.itemDuration}>
              {formatDuration(entry.summary.effectiveDuration)}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = {
  historyItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  itemDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: lightColors.text.inverse,
  },
  itemCategory: { fontSize: 12, color: lightColors.text.muted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' as const },
  itemScore: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: lightColors.semantic.danger,
  },
  itemDuration: { fontSize: 12, color: lightColors.text.muted, marginTop: 2 },
};
