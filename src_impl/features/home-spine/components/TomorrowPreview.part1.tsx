import React from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { TomorrowPreviewPersonalized } from "./TomorrowPreviewPersonalized";


export function TomorrowPreview(props: TomorrowPreviewProps): JSX.Element {
  const { theme } = useTheme();
  const hasEvents = props.events.length > 0;
  const hasChallenges = props.challengesResetting.length > 0;
  const streakStatus = props.streakWillContinue
    ? {
        icon: "🔥",
        text: `Streak continues (${props.currentStreak + 1} days)`,
        color: theme.colors.accent.orange,
      }
    : {
        icon: "⚠️",
        text: "Streak at risk - focus today!",
        color: theme.colors.error.DEFAULT,
      };

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)}>
      <Pressable
        onPress={props.onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          m="lg"
          p="lg"
          borderRadius="xl"
          bg="background.secondary"
          borderWidth={2}
          borderColor="border.light"
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mb="md"
          >
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
          <Box
            flexDirection="row"
            alignItems="center"
            gap="sm"
            mb={hasEvents || hasChallenges ? "md" : undefined}
          >
            <Text fontSize={20}>{streakStatus.icon}</Text>
            <Text variant="body" color={streakStatus.color} fontWeight="600">
              {streakStatus.text}
            </Text>
          </Box>
          {hasChallenges ? (
            <Box mb={hasEvents ? "md" : undefined}>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>🔄</Text>
                <Text variant="caption" color="text.tertiary">
                  CHALLENGES RESET
                </Text>
              </Box>
              {props.challengesResetting.map((challenge) => (
                <Text
                  key={challenge}
                  variant="bodySmall"
                  color="text.secondary"
                  ml="lg"
                >
                  • {challenge}
                </Text>
              ))}
            </Box>
          ) : null}
          {hasEvents ? (
            <Box>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text fontSize={16}>📅</Text>
                <Text variant="caption" color="text.tertiary">
                  EVENTS
                </Text>
              </Box>
              {props.events.map((event) => (
                <Box
                  key={`${event.type}:${event.name}`}
                  flexDirection="row"
                  alignItems="center"
                  gap="sm"
                  ml="lg"
                >
                  <EventIcon type={event.type} />
                  <Text variant="bodySmall" color="text.secondary">
                    {event.name}
                    {event.time ? ` (${event.time})` : ""}
                  </Text>
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

export function TomorrowPreviewCompact({
  streakWillContinue,
  events,
  onPress,
}: {
  streakWillContinue: boolean;
  events: TomorrowPreviewProps["events"];
  onPress: () => void;
}): JSX.Element {
  const eventEmoji =
    events.length > 0
      ? events[0].type === "double_xp"
        ? "🔥"
        : events[0].type === "squad_war"
          ? "⚔️"
          : events[0].type === "boss_rush"
            ? "👹"
            : "🌙"
      : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control"
    >
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
          <Text
            variant="body"
            color={streakWillContinue ? "text.primary" : "error.DEFAULT"}
            fontWeight="600"
          >
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