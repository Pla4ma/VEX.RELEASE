/**
 * Session Home Screen
 *
 * Entry point for the session system.
 * Shows active session or preset selection.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSession } from '../../session/hooks/useSession';
import { useSessionStats } from '../../session/hooks/useSession';
import { ActiveSessionHUD } from '../../session/components/ActiveSessionHUD';
import { SessionPresets } from '../../session/components/SessionPresets';
import { SessionEmptyState } from '../../session/components/states/SessionEmptyState';
import { SessionLoadingState } from '../../session/components/states/SessionLoadingState';
import { SessionControls } from '../../session/components/SessionControls';
import type { SessionPreset } from '../../session/types';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '../../theme';

export default function SessionHomeScreen() {
  const [activeView, setActiveView] = useState<'home' | 'custom'>('home');
  const userId = 'current-user'; // In real app, get from auth context
  const theme = useTheme();

  const styles = getStyles(theme);

  const {
    session,
    isActive,
    isPaused,
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    abandonSession,
  } = useSession(userId);

  const stats = useSessionStats(userId);

  const handleSelectPreset = async (preset: SessionPreset) => {
    // Create and start session from preset
    setActiveView('custom');
  };

  const handleCreateCustom = () => {
    setActiveView('custom');
  };

  if (isLoading) {
    return <SessionLoadingState message="Loading your sessions..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  // Show active session HUD if there's an active session
  if (isActive || isPaused) {
    return (
      <View style={styles.container}>
        <ActiveSessionHUD
          userId={userId}
          onPause={pauseSession}
          onResume={resumeSession}
          onAbandon={abandonSession}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Stats */}
      {stats && stats.stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats.stats.averageSessionDuration ? Math.round(stats.stats.averageSessionDuration) : 0}
            </Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>
      )}

      {/* Presets or Empty State */}
      <View style={styles.content}>
        <SessionPresets
          userId={userId}
          onSelectPreset={handleSelectPreset}
          onCreateCustom={handleCreateCustom}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => createSheet({
  container: {
    flex: 1,
    backgroundColor: theme.colors.semantic.background,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.semantic.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.semantic.primary,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.semantic.textMuted,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.semantic.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
