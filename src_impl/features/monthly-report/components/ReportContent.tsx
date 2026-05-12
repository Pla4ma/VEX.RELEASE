import React from 'react';
import { View } from 'react-native';
import { Box, Text, Stack, Button } from '@components/primitives';
import { useTheme } from '../../../theme';
import type { MonthlyFocusReportSummary } from '../types';

interface ReportContentProps {
  report: MonthlyFocusReportSummary;
  isPremium: boolean;
  onOpenPaywall: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ScoreCard({ label, value, color }: { label: string; value: string; color: string }) {
  const { theme } = useTheme();
  return (
    <Box
      flex={1}
      bg="surface.card"
      borderRadius="lg"
      p="md"
      style={{ minHeight: 80 }}
    >
      <Text variant="caption" color="textMuted">{label}</Text>
      <Text variant="h3" style={{ color, marginTop: theme.spacing[1] }}>{value}</Text>
    </Box>
  );
}

function PatternBar({ label, isStrong }: { label: string; isStrong: boolean }) {
  const { theme } = useTheme();
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      bg="surface.card"
      borderRadius="md"
      p="md"
      mb="sm"
    >
      <Text variant="body" color="text">{label}</Text>
      <Box
        bg={isStrong ? 'success' : 'warning'}
        borderRadius="full"
        px="sm"
        py="xs"
      >
        <Text variant="caption" color="text.inverse">
          {isStrong ? 'Strongest' : 'Weakest'}
        </Text>
      </Box>
    </Box>
  );
}

function PremiumLock({ onOpenPaywall }: { onOpenPaywall: () => void }) {
  const { theme } = useTheme();
  return (
    <Box
      bg="surface.card"
      borderRadius="lg"
      p="md"
      mb="md"
      style={{ opacity: 0.7 }}
    >
      <Text variant="body" color="textMuted" style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}>
        Premium insight available
      </Text>
      <Button
        onPress={onOpenPaywall}
        variant="outline"
        size="sm"
        accessibilityLabel="Unlock premium insights"
        accessibilityRole="button"
        accessibilityHint="Opens the premium subscription page"
      >
        Unlock with Premium
      </Button>
    </Box>
  );
}

export function ReportContent({ report, isPremium, onOpenPaywall }: ReportContentProps): JSX.Element {
  const { theme } = useTheme();
  const deltaColor = report.scoreDelta >= 0 ? theme.colors.success.DEFAULT : theme.colors.error.DEFAULT;
  const deltaPrefix = report.scoreDelta >= 0 ? '+' : '';

  return (
    <Stack gap="md" testID="report-content">
      <Box bg="surface.card" borderRadius="xl" p="lg">
        <Text variant="h4" color="textSecondary">
          {new Date(report.monthStartScore > 0 ? Date.now() : Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Text variant="display" color="text" style={{ fontWeight: '700', marginTop: theme.spacing[1] }}>
          {report.monthEndScore}
        </Text>
        <Text variant="body" color="textSecondary">Focus Score</Text>
        <Text variant="body" style={{ color: deltaColor, fontWeight: '600', marginTop: theme.spacing[2] }}>
          {deltaPrefix}{report.scoreDelta} from month start
        </Text>
      </Box>

      <Box flexDirection="row" gap="md">
        <ScoreCard label="Sessions" value={String(report.sessionCount)} color={theme.colors.text.primary} />
        <ScoreCard label="Focus Time" value={formatTime(report.totalFocusedTime)} color={theme.colors.text.primary} />
      </Box>

      <Box flexDirection="row" gap="md">
        <ScoreCard label="Best Grade" value={report.bestGrade} color={theme.colors.accent.purple} />
        <ScoreCard label="Target" value={String(report.nextMonthTarget)} color={theme.colors.accent.blue} />
      </Box>

      {isPremium ? (
        <>
          <Box bg="surface.card" borderRadius="lg" p="md">
            <Text variant="h5" color="text" style={{ marginBottom: theme.spacing[2] }}>
              Best Focus Window
            </Text>
            <Text variant="h4" color="accent.purple">{report.bestFocusWindow}</Text>
          </Box>

          <Box>
            <Text variant="h5" color="text" style={{ marginBottom: theme.spacing[2] }}>
              Focus Patterns
            </Text>
            <PatternBar label={report.strongestPattern} isStrong />
            <PatternBar label={report.weakestPattern} isStrong={false} />
          </Box>

          {report.aiCoachInsight ? (
            <Box bg="surface.card" borderRadius="lg" p="md">
              <Text variant="h5" color="text" style={{ marginBottom: theme.spacing[2] }}>
                AI Coach Insight
              </Text>
              <Text variant="body" color="textSecondary">{report.aiCoachInsight}</Text>
            </Box>
          ) : null}
        </>
      ) : (
        <>
          <PremiumLock onOpenPaywall={onOpenPaywall} />
          <Box bg="surface.card" borderRadius="lg" p="md" style={{ opacity: 0.4 }}>
            <Text variant="h5" color="textMuted">Best Focus Window</Text>
            <Text variant="body" color="textMuted">Unlock to see your optimal focus time</Text>
          </Box>
          <Box bg="surface.card" borderRadius="lg" p="md" style={{ opacity: 0.4 }}>
            <Text variant="h5" color="textMuted">Focus Patterns</Text>
            <Text variant="body" color="textMuted">Unlock to see your strongest and weakest patterns</Text>
          </Box>
        </>
      )}
    </Stack>
  );
}
