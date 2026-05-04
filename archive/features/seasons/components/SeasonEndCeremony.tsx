/**
 * SeasonEndCeremony Component
 *
 * PHASE 14.3 - Full-screen ceremony when a season ends
 * Shows final rank, achievements, rewards, and season recap
 *
 * @phase 14.3
 */

import React from 'react';
import { Dimensions, Pressable, Share } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Box, Card, Text } from '../../../components/primitives';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { SeasonHistory, UserRankInfo } from '../types';
import { getTierConfig } from '../rank-tiers';
import { getSeasonNarrative } from '../narrative';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SeasonEndCeremonyProps {
  seasonHistory: SeasonHistory;
  seasonName: string;
  seasonTheme: string | null;
  finalRank: UserRankInfo;
  bossesDefeated: number;
  seasonAchievements: string[];
  seasonReward: {
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } | null;
  nextSeasonPreview?: {
    name: string;
    startsInDays: number;
  };
  onComplete: () => void;
}

export const SeasonEndCeremony: React.FC<SeasonEndCeremonyProps> = ({
  seasonHistory,
  seasonName,
  seasonTheme,
  finalRank,
  bossesDefeated,
  seasonAchievements,
  seasonReward,
  nextSeasonPreview,
  onComplete,
}) => {
  const { theme } = useTheme();
  const narrative = getSeasonNarrative(seasonTheme);
  const tierConfig = getTierConfig(finalRank.tier);

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSequence(
      withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }))
    );
    opacity.value = withDelay(200, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleShareRecap = async () => {
    const shareText = `🏆 ${narrative.displayName} Complete!\n\n` +
      `Final Rank: ${tierConfig.name} (${tierConfig.icon})\n` +
      `Tier Reached: ${seasonHistory.finalTier}\n` +
      `Bosses Defeated: ${bossesDefeated}\n` +
      `XP Earned: ${seasonHistory.totalXpEarned.toLocaleString()}\n\n` +
      'Ready for the next season in VEX!';

    await Share.share({ message: shareText });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) {return `${minutes}m`;}
    if (hours < 24) {return `${hours}h ${minutes % 60}m`;}
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  return (
    <Box flex={1} bg="background.primary" p="lg">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', marginTop: 20 }}>
          <Text variant="caption" color={narrative.accentColor} fontWeight="600">
            SEASON COMPLETE
          </Text>
          <Text variant="h2" color="text.primary" textAlign="center" mt="sm">
            {narrative.displayName}
          </Text>
        </Animated.View>

        {/* Final Rank Badge */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} style={[animatedStyle, { alignItems: 'center', marginTop: 24 }]}>
          <Box
            width={120}
            height={120}
            borderRadius="full"
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: `${tierConfig.color}20`,
              borderWidth: 4,
              borderColor: tierConfig.borderColor,
              shadowColor: tierConfig.glowColor || tierConfig.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
            }}
          >
            <Text fontSize={56}>{tierConfig.icon}</Text>
          </Box>
          <Text variant="h3" color={tierConfig.color} mt="md" fontWeight="700">
            {tierConfig.name}
          </Text>
          <Text variant="body" color="text.secondary">
            Top {Math.round(finalRank.percentile)}% this season
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)} style={{ marginTop: 24 }}>
          <Box flexDirection="row" gap="md">
            <StatCard
              label="Final Tier"
              value={`${seasonHistory.finalTier}`}
              icon="🏅"
              color={narrative.accentColor}
            />
            <StatCard
              label="Bosses Defeated"
              value={bossesDefeated.toString()}
              icon="⚔️"
              color={narrative.accentColor}
            />
            <StatCard
              label="XP Earned"
              value={seasonHistory.totalXpEarned.toLocaleString()}
              icon="✨"
              color={narrative.accentColor}
            />
          </Box>
        </Animated.View>

        {/* Focus Time */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)} style={{ marginTop: 16 }}>
          <Card size="sm" style={{ backgroundColor: theme.colors.background.secondary }}>
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="body" color="text.secondary">
                Total Focus Time
              </Text>
              <Text variant="h4" color={narrative.accentColor} fontWeight="700">
                {formatTime(seasonHistory.totalXpEarned * 2)} {/* Approx 2 min per XP */}
              </Text>
            </Box>
          </Card>
        </Animated.View>

        {/* Achievements */}
        {seasonAchievements.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400).delay(600)} style={{ marginTop: 16 }}>
            <Text variant="h4" color="text.primary" mb="sm">
              Season Achievements
            </Text>
            <Box gap="sm">
              {seasonAchievements.map((achievement, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  gap="sm"
                  p="sm"
                  borderRadius="md"
                  bg="background.secondary"
                >
                  <Text fontSize={20}>🏆</Text>
                  <Text variant="bodySmall" color="text.primary">
                    {achievement}
                  </Text>
                </Box>
              ))}
            </Box>
          </Animated.View>
        )}

        {/* Season Reward */}
        {seasonReward && (
          <Animated.View entering={FadeInUp.duration(400).delay(700)} style={{ marginTop: 16 }}>
            <Card
              size="md"
              style={{
                backgroundColor: `${narrative.accentColor}10`,
                borderWidth: 2,
                borderColor: narrative.accentColor,
              }}
            >
              <Box alignItems="center" gap="sm">
                <Text variant="caption" color={narrative.accentColor} fontWeight="600">
                  SEASON EXCLUSIVE REWARD
                </Text>
                <Text fontSize={48}>{seasonReward.icon}</Text>
                <Text variant="h4" color="text.primary" fontWeight="700">
                  {seasonReward.name}
                </Text>
                <Text variant="caption" color="text.secondary" style={{ textTransform: 'uppercase' }}>
                  {seasonReward.rarity}
                </Text>
              </Box>
            </Card>
          </Animated.View>
        )}

        {/* Share Recap Button */}
        <Animated.View entering={FadeInUp.duration(400).delay(800)} style={{ marginTop: 16 }}>
          <Button variant="outline" fullWidth onPress={handleShareRecap}
  accessibilityLabel="Share Season Recap button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Share Season Recap
          </Button>
        </Animated.View>

        {/* Next Season Preview */}
        {nextSeasonPreview && (
          <Animated.View entering={FadeInUp.duration(400).delay(900)} style={{ marginTop: 24 }}>
            <Card size="sm" style={{ backgroundColor: theme.colors.background.secondary }}>
              <Box alignItems="center" gap="sm">
                <Text variant="caption" color="text.tertiary">
                  NEXT SEASON
                </Text>
                <Text variant="h4" color="text.primary">
                  {nextSeasonPreview.name}
                </Text>
                <Text variant="bodySmall" color="text.secondary">
                  Starts in {nextSeasonPreview.startsInDays} days
                </Text>
              </Box>
            </Card>
          </Animated.View>
        )}

        {/* Continue Button */}
        <Animated.View entering={FadeInUp.duration(400).delay(1000)} style={{ marginTop: 24, marginBottom: 20 }}>
          <Button fullWidth onPress={onComplete}
  accessibilityLabel="Continue to Next Season button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Continue to Next Season
          </Button>
        </Animated.View>
      </Animated.ScrollView>
    </Box>
  );
};

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Card
      size="sm"
      style={{
        backgroundColor: theme.colors.background.secondary,
        flex: 1,
        minWidth: 100,
      }}
    >
      <Box alignItems="center" gap="xs">
        <Text fontSize={24}>{icon}</Text>
        <Text variant="h4" color={color} fontWeight="700">
          {value}
        </Text>
        <Text variant="caption" color="text.tertiary">
          {label}
        </Text>
      </Box>
    </Card>
  );
}

export default SeasonEndCeremony;
