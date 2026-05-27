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

export type LoadingContext =
  | "home"
  | "boss"
  | "leaderboard"
  | "coach"
  | "achievements"
  | "challenges"
  | "squad"
  | "profile"
  | "analytics"
  | "default";

interface WittyLoadingStateProps {
  context: LoadingContext;
  bossName?: string;
  coachName?: string;
  squadName?: string;
  style?: TextStyle;
}

const wittyMessages: Record<LoadingContext, string[]> = {
  home: [
    "Loading your focus dashboard...",
    "Warming up your streak data...",
    "Checking your daily momentum...",
    "Summoning your battle stats...",
  ],
  boss: [
    "The boss is preparing...",
    "Summoning the arena...",
    "Sharpening your weapons...",
    "The enemy approaches...",
  ],
  leaderboard: [
    "Counting everyone's hours...",
    "Ranking the legends...",
    "Tallying the scores...",
    "Finding the top performers...",
  ],
  coach: [
    "Your coach is reviewing your patterns...",
    "Analyzing your focus data...",
    "Preparing your insights...",
    "Crafting your next challenge...",
  ],
  achievements: [
    "Gathering your trophies...",
    "Polishing your medals...",
    "Collecting your victories...",
    "Summoning your achievements...",
  ],
  challenges: [
    "Loading your missions...",
    "Preparing the arena...",
    "Setting up the trials...",
    "Summoning the challenges...",
  ],
  squad: [
    "Rallying your squad...",
    "Gathering your team...",
    "Checking squad readiness...",
    "Syncing with your allies...",
  ],
  profile: [
    "Loading your legend...",
    "Summoning your stats...",
    "Gathering your journey...",
    "Preparing your profile...",
  ],
  analytics: [
    "Crunching your numbers...",
    "Analyzing your patterns...",
    "Building your insights...",
    "Processing your data...",
  ],
  default: [
    "Loading...",
    "Preparing your experience...",
    "Gathering data...",
    "Almost there...",
  ],
};

function getRandomMessage(context: LoadingContext): string {
  const messages: string[] = wittyMessages[context] ?? wittyMessages.default;
  return messages[Math.floor(Math.random() * messages.length)]!;
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
