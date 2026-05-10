import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { TomorrowPreviewCompact } from './TomorrowPreviewCompact';
import { TomorrowPreviewPersonalized } from './TomorrowPreviewPersonalized';
import { TomorrowPreviewSession, type TomorrowPreviewSessionProps } from './TomorrowPreviewSession';

export interface TomorrowPreviewProps {
  streakWillContinue: boolean;
  currentStreak: number;
  challengesResetting: string[];
  events: Array<{
    type: 'double_xp' | 'squad_war' | 'boss_rush' | 'season_event' | 'power_hour' | 'prime_time';
    name: string;
    time?: string;
  }>;
  onPress: () => void;
  bossPreview?: { bossName: string; healthPercent: number; rewardName: string; canDefeatTomorrow: boolean } | null;
  streakMilestonePreview?: { days: number; badgeName: string } | null;
  powerHourPreview?: { day: string; time: string } | null;
  rivalPreview?: { rivalName: string; theirMinutes: number; myMinutes: number; gap: number } | null;
  dailyChallengesIncomplete?: boolean;
  xpAvailableTomorrow?: number;
}

function EventIcon({ type }: { type: TomorrowPreviewProps['events'][number]['type'] }): JSX.Element {
  return (
    <Text fontSize={14}>
      {type === 'double_xp' && '🔥'}
      {type === 'squad_war' && '⚔️'}
      {type === 'boss_rush' && '👹'}
      {type === 'season_event' && '🌙'}
    </Text>
  );
}

export function TomorrowPreview(props: TomorrowPreviewProps): JSX.Element {
  const { theme } = useTheme();
  const hasEvents = props.events.length > 0;
  const hasChallenges = props.challengesResetting.length > 0;
  const streakStatus = props.streakWillContinue
    ? { icon: '🔥', text: `Streak continues (${props.currentStreak + 1} days)`, color: theme.colors.accent.orange }
    : { icon: '⚠️', text: 'Streak at risk - focus today!', color: theme.colors.error.DEFAULT };

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)}>
      <Pressable onPress={props.onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box m="lg" p="lg" borderRadius="xl" bg="background.secondary" borderWidth={2} borderColor="border.light">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={20}>➡️</Text>
              <Text variant="h4" color="text.primary">Tomorrow</Text>
            </Box>
            <Text variant="caption" color="text.tertiary">View calendar ›</Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm" mb={hasEvents || hasChallenges ? 'md' : undefined}>
            <Text fontSize={20}>{streakStatus.icon}</Text>
            <Text variant="body" color={streakStatus.color} fontWeight="600">{streakStatus.text}</Text>
          </Box>
          {hasChallenges ? (
            <Box mb={hasEvents ? 'md' : undefined}>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>🔄</Text>
                <Text variant="caption" color="text.tertiary">CHALLENGES RESET</Text>
              </Box>
              {props.challengesResetting.map((challenge) => (
                <Text key={challenge} variant="bodySmall" color="text.secondary" ml="lg">• {challenge}</Text>
              ))}
            </Box>
          ) : null}
          {hasEvents ? (
            <Box>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>📅</Text>
                <Text variant="caption" color="text.tertiary">EVENTS</Text>
              </Box>
              {props.events.map((event) => (
                <Box key={`${event.type}:${event.name}`} flexDirection="row" alignItems="center" gap="sm" ml="lg">
                  <EventIcon type={event.type} />
                  <Text variant="bodySmall" color="text.secondary">{event.name}{event.time ? ` (${event.time})` : ''}</Text>
                </Box>
              ))}
            </Box>
          ) : null}
          <TomorrowPreviewPersonalized
            bossPreview={props.bossPreview}
            dailyChallengesIncomplete={props.dailyChallengesIncomplete}
            hasChallenges={hasChallenges}
            hasEvents={hasEvents}
            powerHourPreview={props.powerHourPreview}
            rivalPreview={props.rivalPreview}
            streakMilestonePreview={props.streakMilestonePreview}
            streakWillContinue={props.streakWillContinue}
            xpAvailableTomorrow={props.xpAvailableTomorrow}
          />
        </Box>
      </Pressable>
    </Animated.View>
  );
}

<<<<<<< HEAD
/**
 * Compact tomorrow preview (for minimal home screen space)
 */
export function TomorrowPreviewCompact({ streakWillContinue, events, onPress }: { streakWillContinue: boolean; events: TomorrowPreviewProps["events"]; onPress: () => void }): JSX.Element {

  const eventEmoji = events.length > 0 ? (events[0].type === "double_xp" ? "🔥" : events[0].type === "squad_war" ? "⚔️" : events[0].type === "boss_rush" ? "👹" : "🌙") : null;

  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" p="md" borderRadius="lg" bg="background.secondary">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={16}>➡️</Text>
          <Text variant="body" color="text.secondary">
            Tomorrow:
          </Text>
          <Text variant="body" color={streakWillContinue ? "text.primary" : "error.DEFAULT"} fontWeight="600">
            {streakWillContinue ? "🔥 Streak continues" : "⚠️ Streak at risk"}
          </Text>
          {eventEmoji && <Text fontSize={16}>{eventEmoji}</Text>}
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
    type: "STREAK_MILESTONE" | "BOSS_NEAR_DEATH" | "RIVAL_GAP" | "POWER_HOUR" | "CHALLENGE_RESET" | "GENERIC";
    headline: string;
    subtext: string;
    emoji: string;
    actionPrompt?: string;
  };
  /** Optional press handler for details */
  onPress?: () => void;
}

export function TomorrowPreviewSession({ preview, onPress }: TomorrowPreviewSessionProps): JSX.Element {
  const { theme } = useTheme();

  const getTypeColor = () => {
    switch (preview.type) {
      case "STREAK_MILESTONE":
        return theme.colors.warning[500]; // Orange for streaks
      case "BOSS_NEAR_DEATH":
        return theme.colors.error[500]; // Red for boss urgency
      case "RIVAL_GAP":
        return theme.colors.primary[500]; // Primary for competition
      case "POWER_HOUR":
        return "#F59E0B"; // Amber/gold for special events
      case "CHALLENGE_RESET":
        return "#10B981"; // Green for new opportunities
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
                justifyContent: "center",
                alignItems: "center",
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
                <Box mt="sm" px="sm" py="xs" borderRadius="md" bg={`${accentColor}15`}>
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

=======
export { TomorrowPreviewCompact, TomorrowPreviewSession, type TomorrowPreviewSessionProps };
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
export default TomorrowPreview;
