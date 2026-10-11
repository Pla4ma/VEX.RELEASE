import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '@/components/primitives/Box'
import { Text } from '@/components/primitives/Text';
import { Skeleton } from '@/shared/ui/primitives';
import { useTheme } from '@/theme';
import { getAchievementDisplayInfo } from '@/features/achievements/definitions';
import type { Achievement } from '@/features/achievements/types';
import { EmptyAchievements } from '@/shared/ui/primitives/EmptyState.variants';
import { vexFire } from '@/theme/tokens/vex-fire';

export interface AchievementWithStatus extends Achievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  completionPercentage: number;
}

export const AchievementCard: React.ComponentType<{
  achievement: AchievementWithStatus;
  onPress: () => void;
}> = ({ achievement, onPress }) => {
  const { theme: _theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, achievement.isUnlocked);
  const rarityColor = achievement.isUnlocked ? vexFire.ember : vexFire.textMuted;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      accessibilityLabel="Achievement category"
      accessibilityRole="button"
      accessibilityHint="Double tap to activate"
    >
      <Animated.View entering={FadeInUp.duration(200)}>
        <Box
          p={4} mx={4} my={2} borderRadius={16}
          style={{
            backgroundColor: vexFire.panel,
            borderWidth: 2,
            borderColor: achievement.isUnlocked ? rarityColor : vexFire.border,
            opacity: achievement.isUnlocked ? 1 : 0.7,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap={3}>
            <Box
              width={56} height={56} borderRadius={28}
              style={{
                backgroundColor: achievement.isUnlocked ? `${rarityColor}20` : vexFire.backgroundSoft,
                borderColor: achievement.isUnlocked ? rarityColor : vexFire.border,
                borderWidth: 2,
              }}
              alignItems="center" justifyContent="center"
            >
              <Text style={{ fontSize: 28, opacity: achievement.isUnlocked ? 1 : 0.5 }}>
                {display.icon}
              </Text>
            </Box>
            <Box flex={1}>
              <Box flexDirection="row" alignItems="center" gap={2} mb={1}>
                <Text
                  variant="h4"
                  style={{ color: achievement.isUnlocked ? vexFire.cream : vexFire.textMuted }}
                  numberOfLines={1}
                >
                  {display.title}
                </Text>
                <Box px={2} py={0.5} borderRadius={4} style={{ backgroundColor: `${rarityColor}30` }}>
                  <Text variant="caption" color={rarityColor} fontWeight="bold">
                    {achievement.rarity}
                  </Text>
                </Box>
              </Box>
              <Text
                variant="bodySmall"
                style={{ color: achievement.isUnlocked ? vexFire.textSecondary : vexFire.textMuted }}
                numberOfLines={2}
              >
                {display.description}
              </Text>
              {!achievement.isUnlocked && achievement.progress > 0 && (
                <Box mt={2}>
                  <Box height={4} borderRadius={2} style={{ backgroundColor: vexFire.backgroundSoft, overflow: 'hidden' }}>
                    <Box
                      height="100%" borderRadius={2}
                      style={{ backgroundColor: rarityColor, width: `${achievement.completionPercentage}%` }}
                    />
                  </Box>
                  <Text variant="caption" color={vexFire.textMuted} mt={1}>
                    {achievement.progress} / {achievement.progressMax}
                  </Text>
                </Box>
              )}
              {achievement.isUnlocked && achievement.unlockedAt && (
                <Text variant="caption" color={vexFire.success} mt={1}>
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              )}
            </Box>
            <Box alignItems="center">
              <Text variant="h4" color={rarityColor}>{achievement.pointValue}</Text>
              <Text variant="caption" color={vexFire.textMuted}>pts</Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    </Pressable>
  );
};

export const AchievementSkeletonCard: React.ComponentType = () => {
  const { theme: _theme } = useTheme();
  return (
    <Box p={4} mx={4} my={2} borderRadius={16} bg={vexFire.panel}>
      <Box flexDirection="row" alignItems="center" gap={3}>
        <Skeleton width={56} height={56} />
        <Box flex={1} gap={2}>
          <Skeleton width={120} height={20} />
          <Skeleton width={200} height={14} />
        </Box>
        <Skeleton width={40} height={24} />
      </Box>
    </Box>
  );
};

export const EmptyState: React.ComponentType<{
  onStartSession?: () => void;
}> = ({ onStartSession }) => {
  const { theme: _theme } = useTheme();

  if (onStartSession) {
    return <EmptyAchievements onStartSession={onStartSession} />;
  }

  return (
    <Box flex={1} alignItems="center" justifyContent="center" p={8}>
      <Text style={{ fontSize: 64 }}>🏆</Text>
      <Text variant="h3" color={vexFire.textSecondary} textAlign="center" mt={4}>
        No achievements yet
      </Text>
      <Text variant="body" color={vexFire.textMuted} textAlign="center" mt={2}>
        Start your first focus session to begin collecting achievements!
      </Text>
    </Box>
  );
};
