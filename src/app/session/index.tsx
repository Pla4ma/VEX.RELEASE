/**
 * Session Home Screen
 *
 * Entry point for the session system.
 * Shows active session or preset selection.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSession } from '../../session/hooks/useSession';
import { sanitizeErrorMessage } from '../../utils/error-sanitizer';
import { useSessionStats } from '../../session/hooks/useSession';
import { ActiveSessionHUD } from '../../session/components/ActiveSessionHUD';
import { SessionPresets } from '../../session/components/SessionPresets';
import { SessionLoadingState } from '../../session/components/states/SessionLoadingState';
import type { SessionPreset } from '../../session/types';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme, type Theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function SessionHomeScreen() {
  const [, setActiveView] = useState<'home' | 'custom'>('home');
  const authUserId = useAuthStore((state) => state.user?.id);
  const { theme } = useTheme();

  const styles = getStyles({ theme });

  const userId = authUserId ?? '';

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
    setActiveView('custom');
  };

  const handleCreateCustom = () => {
    setActiveView('custom');
  };

  if (!authUserId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please sign in to access sessions</Text>
      </View>
    );
  }

  if (isLoading) {
    return <SessionLoadingState message="Loading your sessions..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {sanitizeErrorMessage(error)}</Text>
      </View>
    );
  }

  if (isActive || isPaused) {
    return (
      <View style={styles.container}>
        <ActiveSessionHUD
          userId={authUserId}
          onPause={pauseSession}
          onResume={resumeSession}
          onAbandon={abandonSession}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {stats && stats.stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.stats.totalFocusTime}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <SessionPresets
          userId={authUserId}
          onSelectPreset={handleSelectPreset}
          onCreateCustom={handleCreateCustom}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = ({ theme }: { theme: Theme }) =>
  createSheet({
    container: {
      flex: 1,
      backgroundColor: theme.colors.semantic.background,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: theme.spacing[4],
      gap: theme.spacing[2],
    },
    statBox: {
      flex: 1,
      backgroundColor: theme.colors.semantic.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[4],
      alignItems: 'center',
    },
    statValue: {
      fontSize: theme.typography.heading.h3.fontSize,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.semantic.primary,
    },
    statLabel: {
      fontSize: theme.typography.ui.caption.fontSize,
      color: theme.colors.semantic.textMuted,
      marginTop: theme.spacing[1],
    },
    content: {
      flex: 1,
      padding: theme.spacing[4],
    },
    errorText: {
      color: theme.colors.semantic.danger,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 40,
    },
  });
