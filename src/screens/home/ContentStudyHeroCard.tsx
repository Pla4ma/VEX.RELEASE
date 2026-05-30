import React from "react";
import { View } from "react-native";

import { Button } from "../../components/primitives/Button";
import { Text } from "../../components/primitives/Text";
import { getPremiumCardStyle } from "../../components/premiumStyles";
import { Skeleton } from "../../components/ui/Skeleton";
import { useTheme } from "../../theme";
import type { LearningExecutionCopy } from "../../features/learning-execution";
import { styles, formatMinutes } from "./homeScreenCardStyles";

export interface ContentStudyHeroCardProps {
  activePlan: {
    title: string;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    remainingMinutes: number;
  } | null;
  copy: LearningExecutionCopy;
  hasError: boolean;
  isLoading: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onSeeHowItWorks: () => void;
  onStart: () => void;
}

export function ContentStudyHeroCard({
  activePlan,
  hasError,
  isLoading,
  onContinue,
  onRetry,
  onSeeHowItWorks,
  onStart,
  copy,
}: ContentStudyHeroCardProps) {
  const { theme } = useTheme();
  if (isLoading) {
    return (
      <View
        style={[
          styles.card,
          getPremiumCardStyle("large"),
          styles.studyCard,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.primary[500],
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text variant="label" color={theme.colors.primary[500]}>
          {copy.layerName}
        </Text>
        <Skeleton width={180} height={20} />
        <Skeleton width="100%" height={16} />
        <Skeleton width={132} height={40} borderRadius={12} />
      </View>
    );
  }
  if (hasError) {
    return (
      <View
        style={[
          styles.card,
          getPremiumCardStyle("large"),
          styles.studyCard,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.primary[500],
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text variant="label" color={theme.colors.primary[500]}>
          {copy.layerName}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          We could not load your execution progress right now.
        </Text>
        <Button
          variant="outline"
          onPress={onRetry}
          accessibilityLabel="Retry button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Retry
        </Button>
      </View>
    );
  }
  if (activePlan) {
    return (
      <View
        style={[
          styles.card,
          getPremiumCardStyle("large"),
          styles.studyCard,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.primary[500],
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text
          variant="label"
          color={theme.colors.primary[500]}
        >{`${copy.homeTitle}: "${activePlan.title}"`}</Text>
        <View style={{ gap: theme.spacing[2] }}>
          <View style={[styles.row, { alignItems: "center" }]}>
            <Text
              variant="bodySmall"
              color={theme.colors.text.primary}
            >{`Step ${Math.min(activePlan.completedTasks + 1, activePlan.totalTasks)}/${activePlan.totalTasks}`}</Text>
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              {formatMinutes(activePlan.remainingMinutes)}
            </Text>
          </View>
          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: theme.colors.background.primary,
                borderRadius: theme.borderRadius.full,
              },
            ]}
          >
            <View
              style={[
                styles.barFill,
                {
                  width: `${activePlan.progressPercent}%`,
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: theme.borderRadius.full,
                },
              ]}
            />
          </View>
        </View>
        <Button
          onPress={onContinue}
          accessibilityLabel={`${copy.homeCta} button`}
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >{`${copy.homeCta}: ${activePlan.title}`}</Button>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.card,
        getPremiumCardStyle("large"),
        styles.studyCard,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.primary[500],
          padding: theme.spacing[4],
        },
      ]}
    >
      <Text variant="label" color={theme.colors.primary[500]}>
        {copy.layerName}
      </Text>
      <Text variant="body" color={theme.colors.text.primary}>
        {copy.emptyTitle}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing[3],
          flexWrap: "wrap",
        }}
      >
        <Button
          onPress={onStart}
          accessibilityLabel="Get Started button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          {copy.emptyCta}
        </Button>
        <Button
          variant="outline"
          onPress={onSeeHowItWorks}
          accessibilityLabel="See How It Works button"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          See How It Works
        </Button>
      </View>
    </View>
  );
}
