import React from "react";
import { ScrollView } from "react-native";
import { Box, Card, Text } from "../../components/primitives";
import type { Theme } from "../../theme/types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  masteryPoints: number;
}

interface ProfileMasterySheetProps {
  theme: Theme;
  rankDisplay: { icon: string; title: string };
  totalMasteryPoints: number;
  challenges: Challenge[];
}

export const ProfileMasterySheet: React.FC<ProfileMasterySheetProps> = ({
  theme,
  rankDisplay,
  totalMasteryPoints,
  challenges,
}) => (
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: theme.spacing[5],
      paddingVertical: theme.spacing[4],
      gap: theme.spacing[4],
    }}
  >
    <Text variant="h3" color="text.primary">
      {`${rankDisplay.icon} ${rankDisplay.title}`}
    </Text>
    <Text variant="body" color="text.secondary">
      {`${totalMasteryPoints} total mastery points`}
    </Text>
    {challenges.length > 0 ? (
      challenges.slice(0, 3).map((challenge) => (
        <Card key={challenge.id} size="md" style={{ backgroundColor: theme.colors.background.primary }}>
          <Text variant="h4" color="text.primary">{challenge.title}</Text>
          <Text variant="caption" color="text.secondary" style={{ marginTop: 4 }}>
            {challenge.description}
          </Text>
          <Box height={8} borderRadius={999} overflow="hidden" mt={12} style={{ backgroundColor: theme.colors.background.tertiary }}>
            <Box
              height="100%"
              borderRadius={999}
              style={{
                width: `${Math.max(0, Math.min(100, (challenge.current / Math.max(1, challenge.target)) * 100))}%`,
                backgroundColor: theme.colors.primary[500],
              }}
            />
          </Box>
          <Box flexDirection="row" justifyContent="space-between" mt={8}>
            <Text variant="caption" color="text.tertiary">
              {`${challenge.current}/${challenge.target} ${challenge.unit}`}
            </Text>
            <Text variant="caption" color="success.DEFAULT">{`+${challenge.masteryPoints} MP`}</Text>
          </Box>
        </Card>
      ))
    ) : (
      <Card size="md" style={{ backgroundColor: theme.colors.background.primary }}>
        <Text variant="body" color="text.secondary">
          Complete sessions to unlock mastery challenges
        </Text>
      </Card>
    )}
  </ScrollView>
);
