import React from 'react';
import { Pressable } from 'react-native';
import { Box, Card, Text } from '../../components/primitives';
import { Badge } from '../../components/Badge';
import { Icon } from '../../icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { FocusScoreCard } from '../../features/focus-identity/components/FocusScoreCard';
import { ScoreHistoryChart } from '../../features/focus-identity/components/ScoreHistoryChart';
import { PersonalBestsGrid } from './components/PersonalBestsGrid';
import type { Theme } from '../../theme/types';

interface StatsItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface TechniqueItem {
  key: string;
  label: string;
  color: string;
}

interface MasteryState {
  totalMasteryPoints: number;
  techniques: Record<string, number>;
}

interface ProfileStatsTabProps {
  theme: Theme;
  userId: string | null;
  stats: StatsItem[];
  statsLoading: boolean;
  hasError: boolean;
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: { icon: string; title: string };
  techniques: TechniqueItem[];
  onMasteryPress: () => void;
}

const renderStatItem =
  (theme: Theme, loading: boolean) =>
  (item: StatsItem) => (
    <Box key={item.label} style={{ width: '47%' }}>
      <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}>
        <Icon name={item.icon} size={20} color={item.color} />
        <Text variant="caption" color="text.tertiary" style={{ marginTop: 10 }}>
          {item.label}
        </Text>
        {loading ? (
          <Skeleton width="70%" height={28} borderRadius={10} />
        ) : (
          <Text
            variant="h3"
            style={{
              marginTop: 6,
              color: theme.colors.text.primary,
              fontWeight: '800',
            }}
          >
            {item.value}
          </Text>
        )}
      </Card>
    </Box>
  );

export const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({
  theme,
  userId,
  stats,
  statsLoading,
  hasError,
  mastery,
  masteryLoading,
  rankDisplay,
  techniques,
  onMasteryPress,
}) => {
  const renderStat = renderStatItem(theme, statsLoading);

  return (
    <Box gap={16}>
      {hasError ? (
        <Card size="md" style={{ backgroundColor: theme.colors.background.secondary }}>
          <Text variant="body" color="error.DEFAULT">
            Some profile data could not load. Pull to refresh or revisit this screen in a moment.
          </Text>
        </Card>
      ) : null}
      {userId && <FocusScoreCard userId={userId} size="large" showTrend={true} animate={true} onPress={() => {}} />}
      {userId && <ScoreHistoryChart userId={userId} />}
      <PersonalBestsGrid userId={userId} />
      <Box flexDirection="row" flexWrap="wrap" gap={12}>
        {stats.map(renderStat)}
      </Box>
      <Pressable
        onPress={onMasteryPress}
        accessibilityLabel="View Mastery details"
        accessibilityRole="button"
        accessibilityHint="Opens the full mastery progression screen"
      >
        <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={12}>
            <Box>
              <Text variant="h4" color="text.primary">Mastery</Text>
              <Text variant="caption" color="text.tertiary">
                {`${rankDisplay.icon} ${rankDisplay.title.toUpperCase()}`}
              </Text>
            </Box>
            {masteryLoading ? (
              <Skeleton width={72} height={24} borderRadius={12} />
            ) : (
              <Badge variant="secondary" size="sm">{`${mastery.totalMasteryPoints} pts`}</Badge>
            )}
          </Box>
          {masteryLoading ? (
            <Skeleton lines={5} height={10} borderRadius={999} spacing={10} />
          ) : (
            techniques.map((tech) => (
              <Box key={tech.key} mb={10}>
                <Box flexDirection="row" justifyContent="space-between" mb={6}>
                  <Text variant="caption" color="text.secondary">{tech.label}</Text>
                  <Text variant="caption" color="text.tertiary">
                    {`${mastery.techniques[tech.key]}/25`}
                  </Text>
                </Box>
                <Box height={6} borderRadius={999} overflow="hidden" style={{ backgroundColor: theme.colors.background.tertiary }}>
                  <Box
                    height="100%"
                    borderRadius={999}
                    style={{ width: `${((mastery.techniques[tech.key] ?? 0) / 25) * 100}%`, backgroundColor: tech.color }}
                  />
                </Box>
              </Box>
            ))
          )}
        </Card>
      </Pressable>
    </Box>
  );
};
