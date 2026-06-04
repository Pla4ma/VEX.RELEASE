import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { buttonTap } from '../../utils/haptics';
import { useSessionHistory } from '../hooks/useSession';
import { SessionHistoryCard } from './SessionHistoryCard';
import {
  filterHistory,
  computeStats,
  formatDuration,
} from './session-history-helpers';
import { styles } from './SessionHistory.styles';
import { lightColors } from '@/theme/tokens/colors';

interface SessionHistoryProps {
  userId: string;
  onSelectSession?: (entry: import('../types').SessionHistoryEntry) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  userId,
  onSelectSession,
}) => {
  const { history, isLoading } = useSessionHistory(userId, 50);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'COMPLETED' | 'ABANDONED' | 'FAILED'
  >('ALL');
  const [timeRange, setTimeRange] = useState<
    'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  >('ALL');

  const filteredHistory = useMemo(
    () => filterHistory(history, searchQuery, filterStatus, timeRange),
    [history, searchQuery, filterStatus, timeRange],
  );

  const stats = useMemo(() => computeStats(filteredHistory), [filteredHistory]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.statsHeader}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.total}</Text>
          <Text style={styles.statBoxLabel}>Sessions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statBoxValue, { color: lightColors.semantic.success }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statBoxLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {formatDuration(stats.totalFocusTime)}
          </Text>
          <Text style={styles.statBoxLabel}>Focus Time</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{Math.round(stats.avgScore)}</Text>
          <Text style={styles.statBoxLabel}>Avg Score</Text>
        </View>
      </View>

      {}
      <TextInput
        style={styles.searchInput}
        placeholder="Search sessions..."
        placeholderTextColor={lightColors.text.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((range) => (
            <Pressable
              key={range}
              style={({ pressed }) => [
                styles.filterChip,
                timeRange === range && styles.filterChipActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => { buttonTap(); setTimeRange(range); }}
              accessibilityLabel={`Filter by ${range}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to filter sessions by time range"
            >
              <Text
                style={[
                  styles.filterChipText,
                  timeRange === range && styles.filterChipTextActive,
                ]}
              >
                {range}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['ALL', 'COMPLETED', 'ABANDONED', 'FAILED'] as const).map(
            (status) => (
              <Pressable
                key={status}
                style={({ pressed }) => [
                  styles.filterChip,
                  filterStatus === status && styles.filterChipActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => { buttonTap(); setFilterStatus(status); }}
                accessibilityLabel={`Filter by ${status}`}
                accessibilityRole="button"
                accessibilityHint="Double tap to filter sessions by status"
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ),
          )}
        </ScrollView>
      </View>

      {}
      <ScrollView style={styles.list}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions match your filters</Text>
            <Text style={styles.emptySubtext}>
              Change the filters — or go start a new session to add to your
              history.
            </Text>
          </View>
        ) : (
          filteredHistory.map((entry) => (
            <SessionHistoryCard
              key={entry.sessionId}
              entry={entry}
              onSelect={onSelectSession}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SessionHistory;
