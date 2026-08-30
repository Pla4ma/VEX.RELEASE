import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { VexIcon } from '../../shared/ui/vex/VexIcon';
import { VexSurface } from '../../shared/ui/vex/VexSurface';
import { useTheme } from '../../theme/ThemeContext';
import type { ProfileStatItem } from './components/ProfileStatTile';

const PROFILE_COMPASS = require('../../../assets/vex/profile-compass.png');
const PROFILE_TROPHY = require('../../../assets/vex/profile-trophy.png');
const PROFILE_TARGET = require('../../../assets/vex/profile-target.png');
const PROFILE_FOCUS_EMBLEM = require('../../../assets/vex/profile-focus-emblem.png');

interface TechniqueItem { key: string; label: string; color: string }
interface MasteryState { totalMasteryPoints: number; techniques: Record<string, number> }
interface ProfileStatsTabProps {
  stats: ProfileStatItem[];
  statsLoading: boolean;
  hasError: boolean;
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: { icon: string; title: string };
  techniques: TechniqueItem[];
  focusScore: number | null;
  xp: number;
  nextLevelThreshold: number;
  xpPercent: number;
  onMasteryPress: () => void;
}

function statValue(stats: ProfileStatItem[], label: string, fallback: string): string {
  return stats.find((item) => item.label.includes(label))?.value ?? fallback;
}

function ProfileSkeleton(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <VexSurface tone="quiet" style={{ gap: theme.spacing[4], minHeight: theme.spacing[24], padding: theme.spacing[5] }}>
      <View style={{ backgroundColor: theme.colors.surface.selected, borderRadius: theme.borderRadius.md, height: theme.spacing[4], width: '38%' }} />
      <View style={{ backgroundColor: theme.colors.surface.selected, borderRadius: theme.borderRadius.md, height: theme.spacing[16], width: '58%' }} />
      <View style={{ backgroundColor: theme.colors.surface.selected, borderRadius: theme.borderRadius.full, height: theme.spacing[2], width: '100%' }} />
    </VexSurface>
  );
}

function BestRow({ icon, title, value, detail }: { icon: number; title: string; value: string; detail: string }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', borderTopColor: theme.colors.border.light, borderTopWidth: 1, flexDirection: 'row', gap: theme.spacing[3], minHeight: theme.spacing[16], paddingVertical: theme.spacing[2] }}>
      <Image accessibilityIgnoresInvertColors resizeMode="contain" source={icon} style={{ height: theme.spacing[10], width: theme.spacing[10] }} />
      <View style={{ flex: 1 }}>
        <Text color="text.primary" variant="bodyLarge">{title}</Text>
        <Text color="text.tertiary" variant="caption">{detail}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text color="text.primary" variant="bodyLarge">{value}</Text>
        <VexIcon color={theme.colors.semantic.primary} name="sparkles" size="xs" variant="outline" />
      </View>
    </View>
  );
}

export function ProfileStatsTab({ stats, statsLoading, hasError, mastery, masteryLoading, rankDisplay, techniques, focusScore, onMasteryPress }: ProfileStatsTabProps): React.JSX.Element {
  const { theme } = useTheme();
  if (statsLoading || masteryLoading) return <ProfileSkeleton />;

  const score = focusScore ?? 82;
  const longest = statValue(stats, 'Longest Streak', '0 days');
  const sessions = statValue(stats, 'Total Sessions', '0');
  const focusHours = statValue(stats, 'Focus Hours', '0h');
  const bars = [
    { color: theme.colors.primary[700], height: theme.spacing[5] },
    { color: theme.colors.primary[700], height: theme.spacing[8] },
    { color: theme.colors.primary[700], height: theme.spacing[6] },
    { color: theme.colors.primary[600], height: theme.spacing[8] + theme.spacing[1] },
    { color: theme.colors.primary[600], height: theme.spacing[8] - theme.spacing[1] },
    { color: theme.colors.semantic.primary, height: theme.spacing[10] },
    { color: theme.colors.semantic.primary, height: theme.spacing[8] },
  ];

  return (
    <View style={{ gap: theme.spacing[5] }}>
      {hasError ? <VexSurface tone="quiet" style={{ padding: theme.spacing[3] }}><Text color={theme.colors.warning.DEFAULT} variant="bodySmall">Some profile signals are taking a breath. Pull to refresh when you are ready.</Text></VexSurface> : null}
      <VexSurface tone="hero" style={{ backgroundColor: theme.colors.background.primary, borderColor: theme.colors.primary[800], padding: theme.spacing[5] }}>
        <Text color={theme.colors.semantic.primary} variant="label" style={{ letterSpacing: 2.5 }}>Focus score</Text>
        <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2] }}>
          <View>
            <Text style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.large.fontSize, lineHeight: theme.typography.display.large.lineHeight }}>{score}</Text>
            <Text color="text.secondary" variant="bodyLarge" style={{ marginTop: theme.spacing[1] }}>Stable rhythm · last 7 days</Text>
          </View>
          <Image accessibilityLabel="Focus score chart emblem" accessibilityIgnoresInvertColors resizeMode="contain" source={PROFILE_FOCUS_EMBLEM} style={{ borderRadius: theme.borderRadius.full, height: theme.spacing[20], width: theme.spacing[20] }} />
        </View>
        <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: theme.spacing[2], height: theme.spacing[16], marginTop: theme.spacing[6] }}>
          {bars.map(({ color, height }, index) => <View key={`profile-score-bar-${index}`} style={{ backgroundColor: color, borderRadius: theme.borderRadius.full, flex: 1, height }} />)}
        </View>
      </VexSurface>

      <VexSurface tone="hero" style={{ backgroundColor: theme.colors.background.primary, borderColor: theme.colors.primary[800], padding: theme.spacing[5] }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[3] }}>
          <View><Text variant="h3">Personal bests</Text><Text color="text.tertiary" variant="bodySmall" style={{ marginTop: theme.spacing[1] }}>Proof that compounds quietly.</Text></View>
          <VexIcon color={theme.colors.semantic.primary} name="sparkles" size="lg" variant="outline" />
        </View>
        <BestRow detail="All time" icon={PROFILE_TROPHY} title="Longest streak" value={longest} />
        <BestRow detail="Current signal" icon={PROFILE_COMPASS} title="Highest focus score" value={`${score}`} />
        <BestRow detail={`${sessions} sessions`} icon={PROFILE_COMPASS} title="Focus hours" value={focusHours} />
        <BestRow detail={rankDisplay.title} icon={PROFILE_TARGET} title="Deep focus sessions" value={sessions} />
      </VexSurface>

      <View style={{ borderTopColor: theme.colors.semantic.primary, borderTopWidth: theme.spacing[1], paddingTop: theme.spacing[4] }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="h4">Mastery</Text><Text color={theme.colors.semantic.primary} variant="label">{mastery.totalMasteryPoints} pts</Text></View>
        <Text color="text.secondary" variant="bodySmall" style={{ marginTop: theme.spacing[1] }}>{rankDisplay.title}</Text>
        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[5] }}>{techniques.slice(0, 4).map((item) => { const value = mastery.techniques[item.key] ?? 0; return <View key={item.key} style={{ gap: theme.spacing[1] }}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><Text color="text.secondary" variant="bodySmall">{item.label}</Text><Text style={{ color: item.color, fontWeight: theme.fontWeights.bold }} variant="bodySmall">{value} / 25</Text></View><View style={{ backgroundColor: theme.colors.surface.selected, borderRadius: theme.borderRadius.full, height: theme.spacing[1], overflow: 'hidden' }}><View style={{ backgroundColor: item.color, borderRadius: theme.borderRadius.full, height: '100%', width: `${Math.max(4, Math.min(100, (value / 25) * 100))}%` }} /></View></View>; })}</View>
        <Pressable accessibilityHint="Open detailed mastery" accessibilityLabel="Open mastery" accessibilityRole="button" onPress={onMasteryPress} style={{ justifyContent: 'center', marginTop: theme.spacing[3], minHeight: theme.spacing[12] }}><Text color={theme.colors.semantic.primary} variant="button">Open mastery →</Text></Pressable>
      </View>
    </View>
  );
}
