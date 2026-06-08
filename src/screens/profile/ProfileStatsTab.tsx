import React from 'react';
import { Box, Text } from '../../components/primitives';
import { GlassCard } from '../../components/glass/GlassCard';
import { Icon } from '../../icons';
import { FocusScoreCard } from '../../features/focus-identity/components/FocusScoreCard';
import { ScoreHistoryChart } from '../../features/focus-identity/components/ScoreHistoryChart';
import { PersonalBestsGrid } from './components/PersonalBestsGrid';
import {
  ProfileStatTile,
  type ProfileStatItem,
} from './components/ProfileStatTile';
import { MasteryCard } from './components/MasteryCard';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

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
  userId: string | null;
  stats: ProfileStatItem[];
  statsLoading: boolean;
  hasError: boolean;
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: { icon: string; title: string };
  techniques: TechniqueItem[];
  onMasteryPress: () => void;
}

function ProfileStatsError(): JSX.Element {
  return (
    <GlassCard padding={16} radius={22} size="md" variant="warning">
      <Box alignItems="center" flexDirection="row" gap={12}>
        <Icon
          color={vexLightGlass.semantic.danger}
          name="exclamation-circle"
          size="md"
          variant="outline"
        />
        <Text
          style={{ color: '#B91C1C', fontSize: 13, lineHeight: 18 }}
        >
          Some profile data could not load. Pull to refresh or revisit this screen in a moment.
        </Text>
      </Box>
    </GlassCard>
  );
}

function ProfileStatTiles({
  stats,
  loading,
}: {
  stats: ProfileStatItem[];
  loading: boolean;
}): JSX.Element {
  return (
    <Box flexDirection="row" flexWrap="wrap" gap={10}>
      {stats.map((item) => (
        <ProfileStatTile item={item} key={item.label} loading={loading} />
      ))}
    </Box>
  );
}

export const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({
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
  return (
    <Box gap={10}>
      {hasError ? <ProfileStatsError /> : null}
      {userId ? (
        <FocusScoreCard animate onPress={() => {}} showTrend size="large" userId={userId} />
      ) : null}
      {userId ? <ScoreHistoryChart userId={userId} /> : null}
      <PersonalBestsGrid userId={userId} />
      <ProfileStatTiles loading={statsLoading} stats={stats} />
      <MasteryCard
        mastery={mastery}
        masteryLoading={masteryLoading}
        onPress={onMasteryPress}
        rankDisplay={rankDisplay}
        techniques={techniques}
      />
    </Box>
  );
};
