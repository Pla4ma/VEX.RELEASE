/**
 * Session History
 *
 * List of past sessions with filtering, search, and statistics.
 * Includes streak visualization and trend analysis.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useSessionHistory } from '../hooks/useSession';
import type { SessionHistoryEntry } from '../types';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionHistoryProps {
  userId: string;
  onSelectSession?: (entry: SessionHistoryEntry) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  userId,
  onSelectSession,
}) => {
  const { history, isLoading } = useSessionHistory(userId, 50);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'ABANDONED' | 'FAILED'>('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.config.category?.toLowerCase().includes(query) ||
        h.config.tags?.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(h => h.status === filterStatus);
    }

    // Time range filter
    const now = Date.now();
    if (timeRange === 'TODAY') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(h => (h.endedAt ?? h.createdAt) >= today);
    } else if (timeRange === 'WEEK') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(h => (h.endedAt ?? h.createdAt) >= weekAgo);
    } else if (timeRange === 'MONTH') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(h => (h.endedAt ?? h.createdAt) >= monthAgo);
    }

    return filtered.sort((a, b) => (b.endedAt ?? b.createdAt) - (a.endedAt ?? a.createdAt));
  }, [history, searchQuery, filterStatus, timeRange]);

  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const completed = filteredHistory.filter(h => h.status === 'COMPLETED').length;
    const abandoned = filteredHistory.filter(h => h.status === 'ABANDONED').length;
    const failed = filteredHistory.filter(h => h.status === 'FAILED').length;
    const totalFocusTime = filteredHistory.reduce((acc, h) => acc + (h.summary?.effectiveDuration ?? 0), 0);
    const avgScore = total > 0
      ? filteredHistory.reduce((acc, h) => acc + (h.summary?.finalScore ?? 0), 0) / total
      : 0;

    return { total, completed, abandoned, failed, totalFocusTime, avgScore };
  }, [filteredHistory]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {return `${hours}h ${mins}m`;}
    return `${mins}m`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED': return '#4CAF50';
      case 'ABANDONED': return '#FFA500';
      case 'FAILED': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.total}</Text>
          <Text style={styles.statBoxLabel}>Sessions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statBoxValue, { color: '#4CAF50' }]}>{stats.completed}</Text>
          <Text style={styles.statBoxLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{formatDuration(stats.totalFocusTime)}</Text>
          <Text style={styles.statBoxLabel}>Focus Time</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{Math.round(stats.avgScore)}</Text>
          <Text style={styles.statBoxLabel}>Avg Score</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search sessions..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(range => (
            <Pressable
              key={range}
              style={({ pressed }) => [
                styles.filterChip,
                timeRange === range && styles.filterChipActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setTimeRange(range as 'ALL' | 'TODAY' | 'WEEK' | 'MONTH')}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={[
                styles.filterChipText,
                timeRange === range && styles.filterChipTextActive,
              ]}>
                {range}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'COMPLETED', 'ABANDONED', 'FAILED'].map(status => (
            <Pressable
              key={status}
              style={({ pressed }) => [
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setFilterStatus(status as 'ALL' | 'COMPLETED' | 'ABANDONED' | 'FAILED')}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive,
              ]}>
                {status}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* History List */}
      <ScrollView style={styles.list}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions match your filters</Text>
            <Text style={styles.emptySubtext}>Change the filters — or go start a new session to add to your history.</Text>
          </View>
        ) : (
          filteredHistory.map((entry, _index) => (
            <Pressable
              key={entry.sessionId}
              style={({ pressed }) => [styles.historyItem, pressed && { opacity: 0.8 }]}
              onPress={() => onSelectSession?.(entry)}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <View style={styles.itemLeft}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(entry.status) }]} />
                <View>
                  <Text style={styles.itemDate}>{formatDate(entry.endedAt ?? entry.createdAt)}</Text>
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
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#9E9E9E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  statsHeader: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#fff',
    fontSize: 16,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#e94560',
  },
  filterChipText: {
    color: '#9E9E9E',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemCategory: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e94560',
  },
  itemDuration: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
});

export default SessionHistory;

export * from "./SessionHistory.types";
export * from "./SessionHistory.types";
