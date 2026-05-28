import React from "react";
import { Pressable } from "react-native";
import { Box, Card, Text } from "../../components/primitives";
import { Badge } from "../../components/Badge";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import type { Theme } from "../../theme/types";

interface AchievementCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  progressLabel: string;
  statusLabel: string;
  statusTone: "success" | "secondary";
  accessibilityLabel: string;
}

interface ProfileAchievementsTabProps {
  theme: Theme;
  isLoading: boolean;
  isError: boolean;
  achievements: AchievementCard[];
  onOpenAchievements: () => void;
  onStartSession: () => void;
}

export const ProfileAchievementsTab: React.FC<ProfileAchievementsTabProps> = ({
  theme,
  isLoading,
  isError,
  achievements,
  onOpenAchievements,
  onStartSession,
}) => {
  if (isLoading) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <Skeleton lines={6} height={22} borderRadius={10} spacing={12} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <EmptyState
          icon="!"
          title="Achievements unavailable"
          body="Your identity rewards could not load right now. Retry from the achievements screen or come back after your next session."
          actionLabel="Open achievements"
          onAction={onOpenAchievements}
        />
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <EmptyState
          icon="+"
          title="No earned proof yet"
          body="Complete your first focus session to unlock real achievements on this profile."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </Card>
    );
  }

  return (
    <Box gap={12}>
      {achievements.map((item) => (
        <Pressable
          key={item.id}
          onPress={onOpenAchievements}
          accessibilityLabel={item.accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Opens the full achievement collection"
        >
          <Card
            size="md"
            style={{
              backgroundColor: theme.colors.background.secondary,
              opacity: item.statusTone === "success" ? 1 : 0.7,
            }}
          >
            <Box flexDirection="row" alignItems="center" gap={12}>
              <Box
                width={44}
                height={44}
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
                style={{
                  backgroundColor:
                    item.statusTone === "success"
                      ? theme.colors.primary[100]
                      : theme.colors.background.tertiary,
                }}
              >
                <Text variant="h3" color="text.primary">{item.icon}</Text>
              </Box>
              <Box flex={1}>
                <Text variant="h4" color="text.primary">{item.title}</Text>
                <Text variant="caption" color="text.secondary">{item.description}</Text>
                <Text variant="caption" color="text.tertiary" style={{ marginTop: 4 }}>
                  {item.progressLabel}
                </Text>
              </Box>
              <Badge variant={item.statusTone} size="sm">{item.statusLabel}</Badge>
            </Box>
          </Card>
        </Pressable>
      ))}
    </Box>
  );
};
