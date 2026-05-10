/**
 * Session Home Screen
 *
 * Entry point for the session system.
 * Shows active session or preset selection.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSession } from '../../session/hooks/useSession';
import { useSessionStats } from '../../session/hooks/useSession';
import { ActiveSessionHUD } from '../../session/components/ActiveSessionHUD';
import { SessionPresets } from '../../session/components/SessionPresets';
import { SessionLoadingState } from '../../session/components/states/SessionLoadingState';
import type { SessionPreset } from '../../session/types';
import { createSheet } from '@/shared/ui/create-sheet';

export default function SessionHomeScreen() {
  const [, setActiveView] = useState<'home' | 'custom'>('home');
  const userId = 'current-user'; // In real app, get from auth context

  const {
    isActive,
    isPaused,
    isLoading,
    error,
    pauseSession,
    resumeSession,
    abandonSession,
  } = useSession(userId);

  const stats = useSessionStats(userId);

  const handleSelectPreset = async (_preset: SessionPreset) => {
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

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: '#e94560',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

