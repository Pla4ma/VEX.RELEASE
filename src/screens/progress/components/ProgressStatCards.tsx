import React from 'react';
import { Pressable, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import { StudyOSCard } from '../StudyOSCard';
import type { MotivationProfile } from '../../../features/liveops-config/feature-access-types';

interface ProgressStatCardsProps {
  score: number;
  canOpenStudy: boolean;
  completedSessions: number;
  motivationProfile?: MotivationProfile | null;
  onOpenFocusScore: () => void;
  onOpenAchievements: () => void;
  onOpenMonthlyReport: () => void;
  onOpenSession: () => void;
  onOpenStudy: () => void;
}

interface MetricRowProps {
  label: string;
  value: string;
  progress: number;
  accent?: boolean;
}

function MetricRow({ label, value, progress, accent = false }: MetricRowProps): React.ReactNode {
  const { theme } = useTheme();
  const fill = accent ? theme.colors.primary[500] : theme.colors.accent.purple;
  return (
    <View style={{ gap: theme.spacing[1] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text color="text.secondary" variant="bodySmall">{label}</Text>
        <Text style={{ color: fill, fontWeight: '800' }} variant="bodySmall">{value}</Text>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.surface.selected,
          borderRadius: theme.borderRadius.full,
          height: 6,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: fill,
            borderRadius: theme.borderRadius.full,
            height: 6,
            width: `${Math.max(4, Math.min(100, progress * 100))}%`,
          }}
        />
      </View>
    </View>
  );
}

export function ProgressStatCards({
  score,
  canOpenStudy,
  completedSessions,
  motivationProfile,
  onOpenFocusScore,
  onOpenAchievements,
  onOpenMonthlyReport,
  onOpenSession,
  onOpenStudy,
}: ProgressStatCardsProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <>
      <Pressable
        accessibilityHint="Open your focus score dashboard"
        accessibilityLabel="Focus score card"
        accessibilityRole="button"
        onPress={onOpenFocusScore}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <GlassCard variant="premium" padding={theme.spacing[5]} radius={theme.borderRadius.xl}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: theme.spacing[2] }}>
              <Text color="primary.500" variant="label">Focus score</Text>
              <Text variant="display">{score}</Text>
              <Text color="text.secondary" variant="bodySmall">Stable · last session +6 · 30-day trend +14</Text>
            </View>
            <VexAssetImage name="orangeAnalytics" size={82} opacity={0.92} />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing[1], marginTop: theme.spacing[4] }}>
            {Array.from({ length: 7 }, (_, index) => (
              <View
                key={`bar-${index}`}
                style={{
                  backgroundColor: index > 4 ? theme.colors.primary[500] : theme.colors.accent.purple,
                  borderRadius: theme.borderRadius.full,
                  flex: 1,
                  height: index % 2 === 0 ? 24 : 36,
                }}
              />
            ))}
          </View>
        </GlassCard>
      </Pressable>

      <GlassCard variant="default" padding={theme.spacing[5]} radius={theme.borderRadius.xl}>
        <Text variant="h3">Factor map</Text>
        <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
          <MetricRow accent label="Consistency" progress={0.84} value="84" />
          <MetricRow label="Streak stability" progress={0.78} value="78" />
          <MetricRow accent label="Session quality" progress={0.82} value="82" />
          <MetricRow label="Intentional difficulty" progress={0.75} value="75" />
          <MetricRow accent label="Recency" progress={0.8} value="80" />
        </View>
      </GlassCard>

      <GlassCard variant="default" padding={theme.spacing[5]} radius={theme.borderRadius.xl}>
        <Text color="primary.500" variant="label">What changed</Text>
        <Text variant="h3" style={{ marginTop: theme.spacing[2] }}>
          Cleaner starts improved your rhythm.
        </Text>
        <Text color="text.secondary" variant="body" style={{ marginTop: theme.spacing[2] }}>
          Next target: 100. Keep the first move small and repeatable.
        </Text>
        <View style={{ marginTop: theme.spacing[4] }}>
          <LiquidButton
            accessibilityHint="Open monthly focus report"
            accessibilityLabel="Open monthly report"
            label="Open monthly report"
            onPress={onOpenMonthlyReport}
            rightIcon={<Icon color={theme.colors.primary[500]} name="arrowRight" size="sm" />}
            size="sm"
            variant="outline"
          />
        </View>
      </GlassCard>

      <GlassCard variant="premium" padding={theme.spacing[5]} radius={theme.borderRadius.xl}>
        <Pressable
          accessibilityHint="Open achievements"
          accessibilityLabel="Level progression card"
          accessibilityRole="button"
          onPress={onOpenAchievements}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <Text color="secondary.500" variant="label">Progression</Text>
          <Text variant="display" style={{ marginTop: theme.spacing[2] }}>Level 7</Text>
          <MetricRow accent label="450 XP to Level 8" progress={0.72} value="2.0x" />
        </Pressable>
        <View style={{ marginTop: theme.spacing[4] }}>
          <LiquidButton
            accessibilityHint="Start a focus session"
            accessibilityLabel="Start session"
            label="Start session"
            onPress={onOpenSession}
            size="sm"
            variant="fire"
          />
        </View>
      </GlassCard>

      <StudyOSCard
        canOpenStudy={canOpenStudy}
        completedSessions={completedSessions}
        motivationProfile={motivationProfile}
        onOpenStudy={onOpenStudy}
      />
    </>
  );
}
