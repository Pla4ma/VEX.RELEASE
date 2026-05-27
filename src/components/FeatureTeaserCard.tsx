import React, { useEffect } from "react";
import { View } from "react-native";

import { getPremiumCardStyle } from "./premiumStyles";
import { Button } from "./primitives/Button";
import { Text } from "./primitives/Text";
import { useTheme } from "../theme";
import { useDisclosureAnalytics } from "../features/liveops-config";
import type {
  FeatureKey,
  UserExperienceStage,
} from "../features/liveops-config";
import { UnlockRequirementRow } from "./UnlockRequirementRow";

interface FeatureTeaserCardProps {
  feature: FeatureKey;
  icon: string;
  title: string;
  description: string;
  whyItMatters: string;
  unlockLabel: string;
  progressLabel?: string;
  ctaLabel: string;
  stage: UserExperienceStage;
  onPress: () => void;
}

export function FeatureTeaserCard(props: FeatureTeaserCardProps): JSX.Element {
  const { theme } = useTheme();
  const analytics = useDisclosureAnalytics();

  useEffect(() => {
    analytics.trackFeatureTeaserViewed(props.feature, props.stage);
  }, [analytics, props.feature, props.stage]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.primary[100],
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius["2xl"],
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...getPremiumCardStyle("large"),
      }}
    >
      <View style={{ gap: theme.spacing[1] }}>
        <Text variant="label" color={theme.colors.primary[500]}>
          {`${props.icon} ${props.title}`}
        </Text>
        <Text variant="h4" color={theme.colors.text.primary}>
          {props.description}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {props.whyItMatters}
        </Text>
      </View>
      <UnlockRequirementRow
        label={props.unlockLabel}
        progressLabel={props.progressLabel}
      />
      <Button
        onPress={() => {
          analytics.trackTeaserCtaPressed(
            props.feature,
            props.ctaLabel,
            props.stage,
          );
          props.onPress();
        }}
        accessibilityLabel="Action button"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        {props.ctaLabel}
      </Button>
    </View>
  );
}

export default FeatureTeaserCard;
