/**
 * Coach History View Component
 *
 * Displays history of coach messages with filtering
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { CoachMessage, MessageCategory } from '../schemas';
import { useCoachHistory } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

export interface CoachHistoryViewProps {
  userId: string;
  limit?: number;
}

const CATEGORY_FILTERS: Array<{ value: MessageCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Messages' },
  { value: 'STREAK_RISK', label: 'Streak Alerts' },
  { value: 'MILESTONE_HYPE', label: 'Milestones' },
  { value: 'SESSION_SUGGESTION', label: 'Suggestions' },
  { value: 'MOTIVATION_BOOST', label: 'Motivation' },
];

export function CoachHistoryView({ userId, limit = 100 }: CoachHistoryViewProps): JSX.Element {
  const { data: history, isLoading, isError, error } = useCoachHistory(userId, limit);
  const [selectedFilter, setSelectedFilter] = useState<MessageCategory | 'ALL'>('ALL');

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load history</Text>
        <Text style={styles.errorSubtext}>{error?.message}</Text>
      </View>
    );
  }

  const filteredMessages = selectedFilter === 'ALL'
    ? history?.messages || []
    : (history?.messages || []).filter(m => m.category === selectedFilter);
  const totalMessages = history?.messages.length ?? 0;
  const actionedMessages = history?.messages.filter((message) => message.actionTaken).length ?? 0;
  const responseRate = totalMessages > 0 ? actionedMessages / totalMessages : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach History</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORY_FILTERS.map(filter => (
          <Pressable
            key={filter.value}
            onPress={() => setSelectedFilter(filter.value)}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            accessibilityLabel={`Filter by ${filter.label}`}
            accessibilityState={{ selected: selectedFilter === filter.value }}

          accessibilityRole="button"
          accessibilityHint="Activates this control">
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.statsContainer}>
        <StatCard
          label="Total Messages"
          value={totalMessages}
          icon="💬"
        />
        <StatCard
          label="Response Rate"
          value={`${Math.round(responseRate * 100)}%`}
          icon="📊"
        />
      </View>

      <FlashList
        data={filteredMessages}
        renderItem={({ item }: { item: CoachMessage }) => <HistoryItem message={item} />}
        keyExtractor={(item: CoachMessage) => item.id}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={100}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Your coach will send personalized tips as you use the app
            </Text>
          </View>
        }
      />
    </View>
  );
}

function HistoryItem({ message }: { message: CoachMessage }): JSX.Element {
  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemCategory}>{formatCategory(message.category)}</Text>
        <Text style={styles.itemDate}>{formattedDate} • {formattedTime}</Text>
      </View>
      <Text style={styles.itemContent}>{message.content}</Text>
      {message.actionTaken && (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>Action Taken</Text>
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }): JSX.Element {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function HistorySkeleton(): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonFilter} />
      <View style={styles.skeletonStats} />
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.skeletonItem} />
      ))}
    </View>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
    textTransform: 'uppercase',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  itemContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  actionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  actionBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Skeleton styles
  skeletonTitle: {
    width: 150,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  skeletonFilter: {
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  skeletonStats: {
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  skeletonItem: {
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
