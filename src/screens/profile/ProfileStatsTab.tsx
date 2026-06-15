import React from 'react';
import { Box, Text } from '../../components/primitives/Box';
import { GlassCard } from '../../components/glass/GlassCard';
import { RealisticModeOrb } from '../../components/glass/RealisticModeOrb';
import { VexAssetImage } from '../../components/glass/VexAssetImage';
import { Icon } from '../../icons/components/Icon';
import {
  type ProfileStatItem,
} from './components/ProfileStatTile';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { ReferenceCard } from '../reference-ui/ReferenceCard';
import { ReferenceChart } from '../reference-ui/ReferenceChart';
import { ReferenceMetric } from '../reference-ui/ReferenceMetric';
import { ref, type } from '../reference-ui/referenceTokens';

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

const BESTS = [
  { label: 'Focus Score', value: '92', mode: 'sprint' },
  { label: 'Longest', value: '2h 10m', mode: 'study' },
  { label: 'Best Streak', value: '12d', mode: 'light' },
  { label: 'Comeback', value: '3d', mode: 'recovery' },
] as const;

function ProfileStatsError(): React.ReactNode {
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
          style={{ color: vexLightGlass.semantic.danger, fontSize: 13, lineHeight: 18 }}
        >
          Some profile data could not load. Pull to refresh or revisit this screen in a moment.
        </Text>
      </Box>
    </GlassCard>
  );
}

export const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({
  stats,
  hasError,
  mastery,
  rankDisplay,
  techniques,
  onMasteryPress,
}) => {
  const totalHours = stats.find((item) => item.label.includes('Hours'))?.value ?? '28.4h';
  const completed = stats.find((item) => item.label.includes('Sessions'))?.value ?? '46';

  return (
    <Box gap={10}>
      {hasError ? <ProfileStatsError /> : null}
      <ReferenceCard glow showAsset={false}>
        <Box style={{ position: 'absolute', right: 12, top: 16, zIndex: 1 }}>
          <VexAssetImage name="orangeAnalytics" size={76} opacity={0.92} />
        </Box>
        <Text style={type.title}>Focus Score</Text>
        <Box alignItems="center" flexDirection="row" gap={12}>
          <Text
            style={{
              color: ref.ink,
              fontSize: 44,
              fontWeight: '600',
              letterSpacing: 0,
              lineHeight: 50,
            }}
          >
            82
          </Text>
          <Text style={[type.body, { color: ref.mintDark }]}>Stable</Text>
        </Box>
        <ReferenceChart />
      </ReferenceCard>
      <ReferenceCard accent="fire" showAsset={false}>
        <Text style={type.title}>Personal Bests</Text>
        <Box flexDirection="row" gap={8} style={{ marginTop: 12 }}>
          {BESTS.map((item) => (
            <Box alignItems="center" flex={1} gap={5} key={item.label}>
              <RealisticModeOrb mode={item.mode} size={34} />
              <Text style={[type.body, { fontSize: 10, textAlign: 'center' }]}>
                {item.label}
              </Text>
              <Text style={[type.body, { color: ref.ink, fontWeight: '800', textAlign: 'center' }]}>
                {item.value}
              </Text>
            </Box>
          ))}
        </Box>
      </ReferenceCard>
      <Box flexDirection="row" gap={8}>
        <ReferenceCard accent="fire" asset="coachStar" style={{ flex: 1 }}>
          <Text style={type.body}>Total Focus Hours</Text>
          <Text style={type.title}>{totalHours}</Text>
        </ReferenceCard>
        <ReferenceCard asset="progressBars" style={{ flex: 1 }}>
          <Text style={type.body}>Completed Sessions</Text>
          <Text style={type.title}>{completed}</Text>
        </ReferenceCard>
      </Box>
      <ReferenceCard accent="fire" asset="orangeMastery">
        <Box alignItems="center" flexDirection="row" justifyContent="space-between">
          <Text style={type.title}>Mastery</Text>
          <Text style={[type.body, { color: ref.mintDark }]}>{mastery.totalMasteryPoints} pts</Text>
        </Box>
        <Text style={[type.body, { marginTop: 4 }]}>{rankDisplay.title}</Text>
        <Box gap={8} style={{ marginTop: 12 }}>
          {techniques.map((item) => (
            <ReferenceMetric
              key={item.key}
              label={item.label}
              progress={(mastery.techniques[item.key] ?? 12) / 25}
              tone={item.key === 'consistencyMastery' || item.key === 'comebackMastery' ? 'fire' : 'mint'}
              value={`${mastery.techniques[item.key] ?? 12} / 25`}
            />
          ))}
        </Box>
        <Text
          accessibilityHint="Open detailed mastery"
          accessibilityLabel="Open mastery"
          accessibilityRole="button"
          onPress={onMasteryPress}
          style={[type.body, { color: ref.mintDark, fontWeight: '800', marginTop: 12 }]}
        >
          Open mastery
        </Text>
      </ReferenceCard>
    </Box>
  );
};
