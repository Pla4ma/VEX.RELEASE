/**
 * TomorrowPreview Component
 *
 * Small card at bottom of home screen: "Tomorrow →"
 * Shows: streak status, challenges reset, events
 * Creates appointment mechanics — users plan around it
 *
 * @phase 5A.3
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface TomorrowPreviewProps {
  /** Whether streak will be active tomorrow (if session today) */
  streakWillContinue: boolean;
  /** Current streak days */
  currentStreak: number;
  /** Challenges resetting tomorrow */
  challengesResetting: string[];
  /** Events tomorrow */
  events: Array<{
    type: 'double_xp' | 'squad_war' | 'boss_rush' | 'season_event' | 'power_hour' | 'prime_time';
    name: string;
    time?: string;
  }>;
  /** Navigate to full calendar */
  onPress: () => void;

  // Phase 11.3 - Personalized preview data
  /** Boss data for preview (if boss < 25% health) */
  bossPreview?: {
    bossName: string;
    healthPercent: number;
    rewardName: string;
    canDefeatTomorrow: boolean;
  } | null;
  /** Streak milestone preview (if milestone in 1 day) */
  streakMilestonePreview?: {
    days: number;
    badgeName: string;
  } | null;
  /** Power Hour scheduled tomorrow */
  powerHourPreview?: {
    day: string;
    time: string;
  } | null;
  /** Rival preview data */
  rivalPreview?: {
    rivalName: string;
    theirMinutes: number;
    myMinutes: number;
    gap: number;
  } | null;
  /** Daily challenges not yet completed */
  dailyChallengesIncomplete?: boolean;
  /** Additional XP available tomorrow */
  xpAvailableTomorrow?: number;
}

/**
 * Tomorrow preview card
 */
export function TomorrowPreview({
  streakWillContinue,
  currentStreak,
  challengesResetting,
  events,
  onPress,
  // Phase 11.3 personalized data
  bossPreview,
  streakMilestonePreview,
  powerHourPreview,
  rivalPreview,
  dailyChallengesIncomplete,
  xpAvailableTomorrow,
}: TomorrowPreviewProps): JSX.Element {
  const { theme } = useTheme();

  // Get streak status message
  const getStreakMessage = () => {
    if (streakWillContinue) {
      return {
        icon: '🔥',
        text: `Streak continues (${currentStreak + 1} days)`,
        color: theme.colors.accent.orange,
      };
    }
    return {
      icon: '⚠️',
      text: 'Streak at risk — focus today!',
      color: theme.colors.error.DEFAULT,
    };
  };

  const streakStatus = getStreakMessage();
  const hasEvents = events.length > 0;
  const hasChallenges = challengesResetting.length > 0;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)}>
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg="background.secondary"
          borderWidth={2}
          borderColor="border.light"
        >
          {/* Header */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={20}>➡️</Text>
              <Text variant="h4" color="text.primary">
                Tomorrow
              </Text>
            </Box>
            <Text variant="caption" color="text.tertiary">
              View calendar ›
            </Text>
          </Box>

          {/* Streak status */}
          <Box
            flexDirection="row"
            alignItems="center"
            gap="sm"
            mb={hasEvents || hasChallenges ? 'md' : undefined}
          >
            <Text fontSize={20}>{streakStatus.icon}</Text>
            <Text variant="body" color={streakStatus.color} fontWeight="600">
              {streakStatus.text}
            </Text>
          </Box>

          {/* Challenges resetting */}
          {hasChallenges && (
            <Box mb={hasEvents ? 'md' : undefined}>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>🔄</Text>
                <Text variant="caption" color="text.tertiary">
                  CHALLENGES RESET
                </Text>
              </Box>
              {challengesResetting.map((challenge, i) => (
                <Text key={i} variant="bodySmall" color="text.secondary" ml="lg">
                  • {challenge}
                </Text>
              ))}
            </Box>
          )}

          {/* Events */}
          {hasEvents && (
            <Box>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>📅</Text>
                <Text variant="caption" color="text.tertiary">
                  EVENTS
                </Text>
              </Box>
              {events.map((event, i) => (
                <Box key={i} flexDirection="row" alignItems="center" gap="sm" ml="lg">
                  <Text fontSize={14}>
                    {event.type === 'double_xp' && '🔥'}
                    {event.type === 'squad_war' && '⚔️'}
                    {event.type === 'boss_rush' && '👹'}
                    {event.type === 'season_event' && '🌙'}
                  </Text>
                  <Text variant="bodySmall" color="text.secondary">
                    {event.name}
                    {event.time && ` (${event.time})`}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Phase 11.3 - Personalized Previews */}

          {/* Boss Preview (if < 25% health) */}
          {bossPreview && (
            <Box mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>👹</Text>
                <Text variant="caption" color="text.tertiary">
                  BOSS ALERT
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
                <Text variant="bodySmall" color="text.secondary">
                  {bossPreview.canDefeatTomorrow
                    ? `One good session defeats ${bossPreview.bossName}! Drops: ${bossPreview.rewardName}`
                    : `${bossPreview.bossName} at ${bossPreview.healthPercent.toFixed(0)}% — squad needs your help!`}
                </Text>
              </Box>
            </Box>
          )}

          {/* Streak Milestone Preview */}
          {streakMilestonePreview && (
            <Box mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>🔥</Text>
                <Text variant="caption" color="text.tertiary">
                  STREAK MILESTONE
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
                <Text variant="bodySmall" color="text.secondary">
                  {streakMilestonePreview.days}-day streak! Claim your {streakMilestonePreview.badgeName}
                </Text>
              </Box>
            </Box>
          )}

          {/* Power Hour Preview */}
          {powerHourPreview && (
            <Box mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>🌟</Text>
                <Text variant="caption" color="text.tertiary">
                  POWER HOUR TOMORROW
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
                <Text variant="bodySmall" color="text.secondary">
                  {powerHourPreview.day} at {powerHourPreview.time} — Triple XP for 1 hour!
                </Text>
              </Box>
            </Box>
          )}

          {/* Rival Preview */}
          {rivalPreview && (
            <Box mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>⚔️</Text>
                <Text variant="caption" color="text.tertiary">
                  RIVAL ALERT
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
                <Text variant="bodySmall" color="text.secondary">
                  {rivalPreview.rivalName} is {rivalPreview.gap} min ahead. Close the gap!
                </Text>
              </Box>
            </Box>
          )}

          {/* Daily Challenges Incomplete */}
          {dailyChallengesIncomplete && (
            <Box mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>📋</Text>
                <Text variant="caption" color="text.tertiary">
                  CHALLENGES
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
                <Text variant="bodySmall" color="text.secondary">
                  New challenges reset at midnight (+{xpAvailableTomorrow ?? 50} more XP available)
                </Text>
              </Box>
            </Box>
          )}

          {/* Nothing special */}
          {!hasEvents && !hasChallenges && !bossPreview && !streakMilestonePreview &&
           !powerHourPreview && !rivalPreview && !dailyChallengesIncomplete && streakWillContinue && (
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>✨</Text>
              <Text variant="bodySmall" color="text.tertiary">
                Quiet day — perfect for building that streak!
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Compact tomorrow preview (for minimal home screen space)
 */
export function TomorrowPreviewCompact({
  streakWillContinue,
  events,
  onPress,
}: {
  streakWillContinue: boolean;
  events: TomorrowPreviewProps['events'];
  onPress: () => void;
}): JSX.Element {
  const { theme } = useTheme();

  const eventEmoji = events.length > 0
    ? events[0].type === 'double_xp' ? '🔥'
    : events[0].type === 'squad_war' ? '⚔️'
    : events[0].type === 'boss_rush' ? '👹'
    : '🌙'
    : null;

  return (
    <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        p="md"
        borderRadius="lg"
        bg="background.secondary"
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>➡️</Text>
          <Text variant="body" color="text.secondary">
            Tomorrow:
          </Text>
          <Text variant="body" color={streakWillContinue ? 'text.primary' : 'error.DEFAULT'} fontWeight="600">
            {streakWillContinue ? '🔥 Streak continues' : '⚠️ Streak at risk'}
          </Text>
          {eventEmoji && (
            <Text fontSize={16}>{eventEmoji}</Text>
          )}
        </Box>
        <Text variant="caption" color="text.tertiary">
          ›
        </Text>
      </Box>
    </Pressable>
  );
}

/**
 * PHASE 7.4: Session Completion Preview
 *
 * Shows exactly ONE exciting thing at end of every session.
 * Sourced from real data via tomorrowPreviewService.
 * Never shows generic fallback.
 */
export interface TomorrowPreviewSessionProps {
  /** The computed preview data from tomorrowPreviewService */
  preview: {
    type: 'STREAK_MILESTONE' | 'BOSS_NEAR_DEATH' | 'RIVAL_GAP' | 'POWER_HOUR' | 'CHALLENGE_RESET' | 'GENERIC';
    headline: string;
    subtext: string;
    emoji: string;
    actionPrompt?: string;
  };
  /** Optional press handler for details */
  onPress?: () => void;
}

export function TomorrowPreviewSession({
  preview,
  onPress,
}: TomorrowPreviewSessionProps): JSX.Element {
  const { theme } = useTheme();

  const getTypeColor = () => {
    switch (preview.type) {
      case 'STREAK_MILESTONE':
        return theme.colors.warning[500]; // Orange for streaks
      case 'BOSS_NEAR_DEATH':
        return theme.colors.error[500]; // Red for boss urgency
      case 'RIVAL_GAP':
        return theme.colors.primary[500]; // Primary for competition
      case 'POWER_HOUR':
        return '#F59E0B'; // Amber/gold for special events
      case 'CHALLENGE_RESET':
        return '#10B981'; // Green for new opportunities
      default:
        return theme.colors.primary[500];
    }
  };

  const accentColor = getTypeColor();

  const CardWrapper = onPress ? Pressable : View;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(800)}>
      <CardWrapper onPress={onPress}>
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={accentColor}
          style={{
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Header: Tomorrow indicator */}
          <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
            <Text fontSize={20}>➡️</Text>
            <Text variant="label" color="text.tertiary">
              TOMORROW
            </Text>
          </Box>

          {/* Main Preview Content */}
          <Box flexDirection="row" alignItems="flex-start" gap="md">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.borderRadius.full,
                backgroundColor: `${accentColor}20`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text fontSize={24}>{preview.emoji}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="h4" color="text.primary" fontWeight="700" style={{ marginBottom: theme.spacing[1] }}>
                {preview.headline}
              </Text>
              <Text variant="body" color="text.secondary">
                {preview.subtext}
              </Text>

              {preview.actionPrompt && (
                <Box
                  mt="sm"
                  px="sm"
                  py="xs"
                  borderRadius="md"
                  bg={`${accentColor}15`}
                >
                  <Text variant="caption" color={accentColor} fontWeight="600">
                    {preview.actionPrompt}
                  </Text>
                </Box>
              )}
            </View>
          </Box>
        </Box>
      </CardWrapper>
    </Animated.View>
  );
}

export default TomorrowPreview;
