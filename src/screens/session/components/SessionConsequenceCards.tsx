/**
 * Session Consequence Cards
 *
 * PHASE 7.2 - Post-session consequence display
 *
 * Shows specific consequence cards after session completion:
 * - Boss Impact: boss health bar animated from pre to post
 * - Streak Consequence: streak day completion, next milestone
 * - Challenge Impact: challenge progress before and after
 * - Rival Impact: gap closed or opened
 *
 * Displayed in horizontal scroll row, ordered by most impactful.
 */

import React from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { BossImpactCard } from "./BossImpactCard";
import { StreakConsequenceCard } from "./StreakConsequenceCard";
import { ChallengeImpactCard } from "./ChallengeImpactCard";
import { RivalImpactCard } from "./RivalImpactCard";
import {
  CARD_WIDTH,
  type SessionConsequenceCardsProps,
} from "./session-consequence-types";

export { type SessionConsequenceCardsProps } from "./session-consequence-types";

export function SessionConsequenceCards({
  bossConsequence,
  streakConsequence,
  challengeConsequence,
  rivalConsequence,
}: SessionConsequenceCardsProps): JSX.Element | null {
  const { theme } = useTheme();
  const cards: JSX.Element[] = [];

  if (bossConsequence) {
    cards.push(<BossImpactCard key="boss" {...bossConsequence} />);
  }
  if (streakConsequence) {
    cards.push(<StreakConsequenceCard key="streak" {...streakConsequence} />);
  }
  if (challengeConsequence) {
    cards.push(
      <ChallengeImpactCard key="challenge" {...challengeConsequence} />,
    );
  }
  if (rivalConsequence) {
    cards.push(<RivalImpactCard key="rival" {...rivalConsequence} />);
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(600)}>
      <View style={{ marginVertical: theme.spacing[4] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing[2],
            marginBottom: theme.spacing[3],
            paddingHorizontal: theme.spacing[6],
          }}
        >
          <Text fontSize={16}>🎯</Text>
          <Text variant="label" color="text.tertiary">
            ALSO HAPPENED
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing[6] }}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + theme.spacing[3]}
        >
          {cards}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

export default SessionConsequenceCards;
