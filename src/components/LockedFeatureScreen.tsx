import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPremiumCardStyle } from "./premiumStyles";
import { Button } from "./primitives/Button";
import { Text } from "./primitives/Text";
import { useTheme } from "../theme";
import { UnlockRequirementRow } from "./UnlockRequirementRow";
import { buttonTap } from "../utils/haptics";
import { useDisclosureAnalytics } from "../features/liveops-config";
import type {
  FeatureKey,
  UserExperienceStage,
} from "../features/liveops-config";

interface LockedFeatureScreenProps {
  feature: FeatureKey;
  icon: string;
  title: string;
  stage: UserExperienceStage;
  description: string;
  whyItMatters: string;
  unlockLabel: string;
  progressLabel?: string;
  ctaLabel: string;
  onPress: () => void;
}

export function LockedFeatureScreen(
  props: LockedFeatureScreenProps,
): JSX.Element {
  const { theme } = useTheme();
  const analytics = useDisclosureAnalytics();

  useEffect(() => {
    analytics.trackLockedFeatureScreenViewed(props.feature, props.stage);
  }, [analytics, props.feature, props.stage]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing[5],
          gap: theme.spacing[4],
          justifyContent: "center",
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primary[100],
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius["3xl"],
            padding: theme.spacing[5],
            gap: theme.spacing[4],
            ...getPremiumCardStyle("large"),
          }}
        >
          <View style={{ gap: theme.spacing[2] }}>
            <Text variant="label" color={theme.colors.primary[500]}>
              {`${props.icon} ${props.title}`}
            </Text>
            <Text variant="h2" color={theme.colors.text.primary}>
              {props.description}
            </Text>
            <Text variant="body" color={theme.colors.text.secondary}>
              {props.whyItMatters}
            </Text>
          </View>
          <UnlockRequirementRow
            label={props.unlockLabel}
            progressLabel={props.progressLabel}
          />
          <Button
            onPress={() => {
              buttonTap();
              analytics.trackTeaserCtaPressed(
                props.feature,
                props.ctaLabel,
                props.stage,
              );
              props.onPress();
            }}
            accessibilityLabel={props.ctaLabel}
            accessibilityRole="button"
            accessibilityHint="Double tap to learn more"
          >
            {props.ctaLabel}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LockedFeatureScreen;
