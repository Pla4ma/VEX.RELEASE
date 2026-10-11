import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { FloatingDroplets } from '../../components/glass/FloatingDroplets';
import { EmptyStateLens } from '../../components/glass/EmptyStateLens';
import { VexSurface } from '../../shared/ui/vex/VexSurface';
import type { Theme } from '../../theme/types';
import { vexFire } from '../../theme/tokens/vex-fire';

const MASTERY_MEDALLION = require('../../../assets/vex/profile-mastery-medallion.png');

interface AchievementCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  progressLabel: string;
  statusLabel: string;
  statusTone: 'success' | 'secondary';
  accessibilityLabel: string;
}

interface ProfileAchievementsTabProps {
  theme: Theme;
  isLoading: boolean;
  isError: boolean;
  achievements: AchievementCard[];
  onOpenAchievements: () => void;
  onStartSession: () => void;
}

export const ProfileAchievementsTab: React.ComponentType<ProfileAchievementsTabProps> = ({
  theme,
  isLoading,
  isError,
  achievements,
  onOpenAchievements,
  onStartSession,
}) => {
  if (isLoading) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <Skeleton lines={6} height={22} borderRadius={10} spacing={12} />
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <EmptyState
          iconName="exclamation-circle"
          title="Achievements unavailable"
          body="Your identity rewards could not load right now. Retry from the achievements screen or come back after your next session."
          actionLabel="Open achievements"
          onAction={onOpenAchievements}
        />
      </GlassCard>
    );
  }

  if (achievements.length === 0) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={4} opacity={0.65} size={36} />
        </View>
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            left: 12,
            bottom: 12,
            zIndex: 0,
          }}
        >
          <EmptyStateLens size={56} opacity={0.65} dotCount={3} />
        </View>
        <EmptyState
          iconName="plus-circle"
          title="No earned proof yet"
          body="Complete your first focus session to unlock real achievements on this profile."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </GlassCard>
    );
  }

  return (
    <Box gap={theme.spacing[3]}>
      {achievements.map((item) => (
        <Pressable
          key={item.id}
          onPress={onOpenAchievements}
          accessibilityLabel={item.accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Opens the full achievement collection"
        >
          <VexSurface tone="base" style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, opacity: item.statusTone === 'success' ? 1 : theme.opacity[80], padding: theme.spacing[4] }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[3] }}>
              <View style={{ borderColor: vexFire.border, borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[12], overflow: 'hidden', width: theme.spacing[12] }}>
                <Image accessibilityLabel="Glass mastery medallion" source={MASTERY_MEDALLION} style={{ height: '100%', opacity: item.statusTone === 'success' ? theme.opacity[100] : theme.opacity[80], width: '100%' }} />
              </View>
              <View style={{ flex: 1, gap: theme.spacing[1] }}>
                <Text color={vexFire.cream} variant="bodyLarge">{item.title}</Text>
                <Text color={vexFire.textSecondary} variant="bodySmall">{item.description}</Text>
                <Text color={vexFire.textMuted} variant="caption">{item.progressLabel}</Text>
              </View>
              <View style={{ backgroundColor: item.statusTone === 'success' ? vexFire.copper : vexFire.backgroundSoft, borderColor: vexFire.border, borderRadius: theme.borderRadius.full, borderWidth: 1, paddingHorizontal: theme.spacing[2], paddingVertical: theme.spacing[1] }}>
                <Text color={item.statusTone === 'success' ? vexFire.cream : vexFire.amber} variant="caption">{item.statusLabel}</Text>
              </View>
            </View>
          </VexSurface>
        </Pressable>
      ))}
    </Box>
  );
};
