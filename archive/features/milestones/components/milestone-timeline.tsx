/**
 * Milestone Timeline Component
 * Visual timeline of milestones with progress indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================

interface MilestoneTimelineProps {
  userId: string;
  userLevel: number;
  streakDays: number;
  sessionsCompleted: number;
  bossDefeats: number;
}

interface TimelineItem {
  id: string;
  name: string;
  description: string;
  type: 'LEVEL' | 'STREAK' | 'SESSION' | 'BOSS';
  threshold: number;
  currentValue: number;
  completed: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function MilestoneTimeline({
  userLevel,
  streakDays,
  sessionsCompleted,
  bossDefeats,
}: MilestoneTimelineProps) {
  // Build timeline items
  const items: TimelineItem[] = [
    // Level milestones
    { id: 'level-3', name: 'Novice', description: 'Reach level 3', type: 'LEVEL', threshold: 3, currentValue: userLevel, completed: userLevel >= 3 },
    { id: 'level-5', name: 'Apprentice', description: 'Reach level 5', type: 'LEVEL', threshold: 5, currentValue: userLevel, completed: userLevel >= 5 },
    { id: 'level-10', name: 'Adept', description: 'Reach level 10', type: 'LEVEL', threshold: 10, currentValue: userLevel, completed: userLevel >= 10 },
    { id: 'level-20', name: 'Expert', description: 'Reach level 20', type: 'LEVEL', threshold: 20, currentValue: userLevel, completed: userLevel >= 20 },
    // Streak milestones
    { id: 'streak-3', name: 'Getting Started', description: '3 day streak', type: 'STREAK', threshold: 3, currentValue: streakDays, completed: streakDays >= 3 },
    { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', type: 'STREAK', threshold: 7, currentValue: streakDays, completed: streakDays >= 7 },
    { id: 'streak-30', name: 'Monthly Master', description: '30 day streak', type: 'STREAK', threshold: 30, currentValue: streakDays, completed: streakDays >= 30 },
    // Session milestones
    { id: 'sessions-10', name: 'Beginner', description: '10 sessions', type: 'SESSION', threshold: 10, currentValue: sessionsCompleted, completed: sessionsCompleted >= 10 },
    { id: 'sessions-50', name: 'Regular', description: '50 sessions', type: 'SESSION', threshold: 50, currentValue: sessionsCompleted, completed: sessionsCompleted >= 50 },
    { id: 'sessions-100', name: 'Veteran', description: '100 sessions', type: 'SESSION', threshold: 100, currentValue: sessionsCompleted, completed: sessionsCompleted >= 100 },
    // Boss milestones
    { id: 'boss-1', name: 'First Victory', description: 'Defeat 1 boss', type: 'BOSS', threshold: 1, currentValue: bossDefeats, completed: bossDefeats >= 1 },
    { id: 'boss-5', name: 'Boss Hunter', description: 'Defeat 5 bosses', type: 'BOSS', threshold: 5, currentValue: bossDefeats, completed: bossDefeats >= 5 },
  ];

  const completedCount = items.filter(i => i.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Milestones</Text>
        <Text style={styles.progress}>
          {completedCount}/{items.length} completed
        </Text>
      </View>

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => (
          <TimelineRow
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Timeline Row Component
// ============================================================================

interface TimelineRowProps {
  item: TimelineItem;
  isLast: boolean;
}

function TimelineRow({ item, isLast }: TimelineRowProps) {
  const percentComplete = Math.min(
    100,
    Math.floor((item.currentValue / item.threshold) * 100)
  );

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'LEVEL': return '#3b82f6';
      case 'STREAK': return '#f59e0b';
      case 'SESSION': return '#22c55e';
      case 'BOSS': return '#a855f7';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.row}>
      {/* Connector Line */}
      {!isLast && <View style={styles.connector} />}

      {/* Indicator */}
      <View
        style={[
          styles.indicator,
          item.completed && styles.indicatorCompleted,
          { borderColor: getTypeColor(item.type) },
        ]}
      >
        {item.completed && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getTypeColor(item.type) + '30' },
            ]}
          >
            <Text style={[styles.badgeText, { color: getTypeColor(item.type) }]}>
              {item.type}
            </Text>
          </View>
        </View>

        <Text style={styles.itemDescription}>{item.description}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBar,
                { width: `${percentComplete}%`, backgroundColor: getTypeColor(item.type) },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.currentValue} / {item.threshold} ({percentComplete}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  progress: {
    fontSize: 14,
    color: '#9ca3af',
  },
  timeline: {
    maxHeight: 350,
  },
  row: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 20,
  },
  connector: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: '#374151',
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  indicatorCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
  },
});
