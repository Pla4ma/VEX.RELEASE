/**
 * Witty Loading State Component
 * Context-aware loading messages with VEX personality
 *
 * @phase 23.2 — Loading states have wit
 */

import React from "react";
import { View, TextStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Skeleton } from "../primitives/Skeleton";
import { useTheme } from "../../../theme";
import { Text } from "../../../components/primitives/Text";
import {
  type LoadingContext,
  getRandomMessage,
} from "./witty-loading-messages";

export type { LoadingContext };

interface WittyLoadingStateProps {
  context: LoadingContext;
  bossName?: string;
  coachName?: string;
  squadName?: string;
  style?: TextStyle;
}

export function WittyLoadingState({
  context,
  bossName,
  coachName,
  squadName,
  style,
}: WittyLoadingStateProps): JSX.Element {
  const { theme } = useTheme();

  let message = getRandomMessage(context);

  // Replace placeholders with actual names
  if (bossName) {
    message = message.replace("The boss", bossName);
  }
  if (coachName) {
    message = message.replace("Your coach", coachName);
  }
  if (squadName) {
    message = message.replace("your squad", squadName);
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        },
        style,
      ]}
    >
      <Skeleton width={120} height={120} variant="circular" />
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Text
          variant="body"
          color={theme.colors.text.secondary}
          style={{ textAlign: "center" }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

// Context-specific loading state exports
export function HomeLoadingState(): JSX.Element {
  return <WittyLoadingState context="home" />;
}

export function BossLoadingState({
  bossName,
}: {
  bossName?: string;
}): JSX.Element {
  return <WittyLoadingState context="boss" bossName={bossName} />;
}

export function LeaderboardLoadingState(): JSX.Element {
  return <WittyLoadingState context="leaderboard" />;
}

export function CoachLoadingState({
  coachName,
}: {
  coachName?: string;
}): JSX.Element {
  return <WittyLoadingState context="coach" coachName={coachName} />;
}

export function AchievementsLoadingState(): JSX.Element {
  return <WittyLoadingState context="achievements" />;
}

export function ChallengesLoadingState(): JSX.Element {
  return <WittyLoadingState context="challenges" />;
}

export function SquadLoadingState({
  squadName,
}: {
  squadName?: string;
}): JSX.Element {
  return <WittyLoadingState context="squad" squadName={squadName} />;
}

export function ProfileLoadingState(): JSX.Element {
  return <WittyLoadingState context="profile" />;
}

export function AnalyticsLoadingState(): JSX.Element {
  return <WittyLoadingState context="analytics" />;
}

export default WittyLoadingState;
