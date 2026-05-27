import React from "react";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import type { TomorrowPreviewProps } from "./TomorrowPreview";

type Props = Pick<
  TomorrowPreviewProps,
  | "bossPreview"
  | "dailyChallengesIncomplete"
  | "powerHourPreview"
  | "rivalPreview"
  | "streakMilestonePreview"
  | "streakWillContinue"
  | "xpAvailableTomorrow"
> & {
  hasChallenges: boolean;
  hasEvents: boolean;
};

function PreviewLine({
  icon,
  label,
  text,
}: {
  icon: string;
  label: string;
  text: string;
}): JSX.Element {
  return (
    <Box mb="md">
      <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
        <Text fontSize={16}>{icon}</Text>
        <Text variant="caption" color="text.tertiary">
          {label}
        </Text>
      </Box>
      <Box flexDirection="row" alignItems="center" gap="sm" ml="lg">
        <Text variant="bodySmall" color="text.secondary">
          {text}
        </Text>
      </Box>
    </Box>
  );
}

export function TomorrowPreviewPersonalized(props: Props): JSX.Element | null {
  if (props.bossPreview) {
    const boss = props.bossPreview;
    return (
      <PreviewLine
        icon="👹"
        label="BOSS ALERT"
        text={
          boss.canDefeatTomorrow
            ? `One good session defeats ${boss.bossName}! Drops: ${boss.rewardName}`
            : `${boss.bossName} at ${boss.healthPercent.toFixed(0)}% - squad needs your help!`
        }
      />
    );
  }
  if (props.streakMilestonePreview) {
    const streak = props.streakMilestonePreview;
    return (
      <PreviewLine
        icon="🔥"
        label="STREAK MILESTONE"
        text={`${streak.days}-day streak! Claim your ${streak.badgeName}`}
      />
    );
  }
  if (props.powerHourPreview) {
    const powerHour = props.powerHourPreview;
    return (
      <PreviewLine
        icon="🌟"
        label="POWER HOUR TOMORROW"
        text={`${powerHour.day} at ${powerHour.time} - Triple XP for 1 hour!`}
      />
    );
  }
  if (props.rivalPreview) {
    const rival = props.rivalPreview;
    return (
      <PreviewLine
        icon="⚔️"
        label="RIVAL ALERT"
        text={`${rival.rivalName} is ${rival.gap} min ahead. Close the gap!`}
      />
    );
  }
  if (props.dailyChallengesIncomplete) {
    return (
      <PreviewLine
        icon="📋"
        label="CHALLENGES"
        text={`New challenges reset at midnight (+${props.xpAvailableTomorrow ?? 50} more XP available)`}
      />
    );
  }
  if (!props.hasEvents && !props.hasChallenges && props.streakWillContinue) {
    return (
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={16}>✨</Text>
        <Text variant="bodySmall" color="text.tertiary">
          Quiet day - perfect for building that streak!
        </Text>
      </Box>
    );
  }
  return null;
}
