import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box, Text } from '@/components/primitives';
import { Skeleton } from '@/shared/ui/primitives';
import { useTheme } from '@/theme';
import { getRarityColor, getAchievementDisplayInfo } from '@/features/achievements/definitions';
import type { Achievement } from '@/features/achievements/types';
import { EmptyAchievements } from '@/shared/ui/primitives/EmptyState.variants';

export interface AchievementWithStatus extends Achievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  completionPercentage: number;
}

export const AchievementCard: React.FC<{
  achievement: AchievementWithStatus;
  onPress: () => void;
}> = ({ achievement, onPress }) => {
  const { theme } = useTheme();
  const display = getAchievementDisplayInfo(achievement, achievement.isUnlocked);
  const rarityColor = getRarityColor(achievement.rarity);
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
          bg={theme.colors.background.secondary}
          style={{
            borderWidth: 2,
            borderColor: achievement.isUnlocked ? rarityColor : theme.colors.border.DEFAULT,
            opacity: achievement.isUnlocked ? 1 : 0.7,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap={3}>
            <Box
              width={56} height={56} borderRadius={28}
              bg={achievement.isUnlocked ? `${rarityColor}20` : theme.colors.background.tertiary}
              alignItems="center" justifyContent="center"
              style={{
                borderWidth: 2,
                borderColor: achievement.isUnlocked ? rarityColor : theme.colors.border.DEFAULT,
              }}
            >
              <Text style={{ fontSize: 28, opacity: achievement.isUnlocked ? 1 : 0.5 }}>
                {display.icon}
              </Text>
            </Box>
            <Box flex={1}>
              <Box flexDirection="row" alignItems="center" gap={2} mb={1}>
                <Text
                  variant="h4"
                  color={achievement.isUnlocked ? theme.colors.text.primary : theme.colors.text.tertiary}
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
                color={achievement.isUnlocked ? theme.colors.text.secondary : theme.colors.text.tertiary}
                numberOfLines={2}
              >
                {display.description}
              </Text>
              {!achievement.isUnlocked && achievement.progress > 0 && (
                <Box mt={2}>
                  <Box height={4} borderRadius={2} bg={theme.colors.background.tertiary} style={{ overflow: 'hidden' }}>
                    <Box
                      height="100%" borderRadius={2} bg={rarityColor}
                      style={{ width: `${achievement.completionPercentage}%` }}
                    />
                  </Box>
                  <Text variant="caption" color={theme.colors.text.tertiary} mt={1}>
                    {achievement.progress} / {achievement.progressMax}
                  </Text>
                </Box>
              )}
              {achievement.isUnlocked && achievement.unlockedAt && (
                <Text variant="caption" color={theme.colors.success.DEFAULT} mt={1}>
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              )}
            </Box>
            <Box alignItems="center">
              <Text variant="h4" color={rarityColor}>{achievement.pointValue}</Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>pts</Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>
    </Pressable>
  );
};

export const AchievementSkeletonCard: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Box p={4} mx={4} my={2} borderRadius={16} bg={theme.colors.background.secondary}>
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

export const EmptyState: React.FC<{
  onStartSession?: () => void;
}> = ({ onStartSession }) => {
  if (onStartSession) {
    return <EmptyAchievements onStartSession={onStartSession} />;
  }

  const { theme } = useTheme();
  return (
    <Box flex={1} alignItems="center" justifyContent="center" p={8}>
      <Text style={{ fontSize: 64 }}>🏆</Text>
      <Text variant="h3" color={theme.colors.text.secondary} textAlign="center" mt={4}>
        No achievements yet
      </Text>
      <Text variant="body" color={theme.colors.text.tertiary} textAlign="center" mt={2}>
        Start your first focus session to begin collecting achievements!
      </Text>
    </Box>
  );
};
