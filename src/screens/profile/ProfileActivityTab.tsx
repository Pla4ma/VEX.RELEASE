import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { FlashList } from '@shopify/flash-list';
import type { Theme } from '../../theme/types';
import type { SessionHistoryEntry } from '../../session/types';
import { vexFire } from '../../theme/tokens/vex-fire';

const EMPTY_STATE_EMBER = require('../../../assets/vex/empty-state-ember-core.png');

interface ProfileActivityTabProps {
  theme: Theme;
  isLoading: boolean;
  isError: boolean;
  history: SessionHistoryEntry[];
  onStartSession: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(entry: SessionHistoryEntry): string {
  return `${Math.max(1, Math.round((entry.summary?.effectiveDuration ?? 0) / 60))} min`;
}

function FirePanel({ children, theme, minHeight, padding = 0 }: { children: React.ReactNode; theme: Theme; minHeight?: number; padding?: number }): React.JSX.Element {
  return <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius['2xl'], borderWidth: 1, minHeight, padding }}>{children}</View>;
}

const renderSessionCard =
  (theme: Theme) =>
  ({ item }: { item: SessionHistoryEntry }): React.ReactNode => (
    <View style={{ marginBottom: theme.spacing[3] }}>
      <FirePanel padding={theme.spacing[4]} theme={theme}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Text
              style={{
                color: vexFire.cream,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              {item.config.customName ?? 'Focus Session'}
            </Text>
            <Text
              style={{
                color: vexFire.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {`${formatDate(item.startedAt)} | ${formatDuration(item)}`}
            </Text>
          </Box>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={{ backgroundColor: vexFire.backgroundSoft, borderColor: vexFire.border, borderRadius: theme.borderRadius.full, borderWidth: 1, paddingHorizontal: theme.spacing[2], paddingVertical: theme.spacing[1] }}><Text color={vexFire.amber} variant="caption">{item.status}</Text></View>
            <Text
              style={{
                color: vexFire.textMuted,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {`${item.summary?.xpEarned ?? 0} XP`}
            </Text>
          </View>
        </Box>
      </FirePanel>
    </View>
  );

export const ProfileActivityTab = React.memo(({
  theme,
  isLoading,
  isError,
  history,
  onStartSession,
}: ProfileActivityTabProps) => {
  if (isLoading) {
    return (
      <FirePanel minHeight={theme.spacing[24] * 2} padding={theme.spacing[5]} theme={theme}>
        <Skeleton lines={5} height={52} borderRadius={14} spacing={12} />
      </FirePanel>
    );
  }

  if (isError) {
    return (
      <FirePanel minHeight={theme.spacing[24] * 2} padding={theme.spacing[5]} theme={theme}>
        <View style={{ alignItems: 'center', gap: theme.spacing[3], justifyContent: 'center', minHeight: theme.spacing[24] + theme.spacing[8] }}>
          <Text color={vexFire.amber} variant="label">Activity interrupted</Text>
          <Text color={vexFire.textSecondary} textAlign="center" variant="bodySmall">VEX couldn’t read your recent sessions.</Text>
          <Pressable accessibilityHint="Starts a focus session" accessibilityLabel="Start session" accessibilityRole="button" onPress={onStartSession} style={{ alignItems: 'center', borderColor: vexFire.ember, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[12], paddingHorizontal: theme.spacing[5] }}><Text color={vexFire.ember} variant="button">Start session</Text></Pressable>
        </View>
      </FirePanel>
    );
  }

  if (history.length === 0) {
    return (
      <FirePanel minHeight={theme.spacing[24] * 3} padding={theme.spacing[5]} theme={theme}>
        <View style={{ alignItems: 'center', gap: theme.spacing[3], justifyContent: 'center', minHeight: theme.spacing[24] * 2 }}>
          <Image accessibilityLabel="Ember core" accessibilityIgnoresInvertColors source={EMPTY_STATE_EMBER} style={{ borderRadius: theme.borderRadius.full, height: theme.spacing[24], width: theme.spacing[24] }} />
          <Text color={vexFire.cream} textAlign="center" variant="h3">No recent activity</Text>
          <Text color={vexFire.textSecondary} textAlign="center" variant="bodyLarge">Start a session to turn your profile into a live record of wins, streaks, and progression.</Text>
          <Pressable accessibilityHint="Starts a focus session" accessibilityLabel="Start session" accessibilityRole="button" onPress={onStartSession} style={{ alignItems: 'center', borderColor: vexFire.ember, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[12], paddingHorizontal: theme.spacing[5] }}><Text color={vexFire.ember} variant="button">Start session</Text></Pressable>
        </View>
      </FirePanel>
    );
  }

  return (
    <Box style={{ height: Math.max(360, history.length * 86) }}>
      <FlashList
        data={history}
        estimatedItemSize={86}
        keyExtractor={(item: SessionHistoryEntry) => item.sessionId}
        renderItem={renderSessionCard(theme)}
      />
    </Box>
  );
});

ProfileActivityTab.displayName = 'ProfileActivityTab';
