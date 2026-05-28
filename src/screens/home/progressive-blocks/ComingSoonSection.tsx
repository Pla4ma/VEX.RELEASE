import React from "react";
import { View } from "react-native";

import { FeatureTeaserCard } from "../../../components/FeatureTeaserCard";
import { Text } from "../../../components/primitives/Text";
import type {
  FeatureAccessMap,
  FeatureKey,
  UserExperienceStage,
} from "../../../features/liveops-config";
import { HOME_FEATURE_COPY } from "../home-feature-copy";

export function ComingSoonSection({
  features,
  stage,
  onPress,
}: {
  features: FeatureAccessMap;
  stage: UserExperienceStage;
  onPress: (feature: FeatureKey) => void;
}) {
  const entries = Object.entries(features) as Array<
    [FeatureKey, FeatureAccessMap[FeatureKey]]
  >;
  const teased = entries
    .filter(([, value]) => value.isTeased)
    .sort((a, b) => (a[1]?.priority ?? 0) - (b[1]?.priority ?? 0))
    .slice(0, 2);

  if (teased.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <Text variant="h4">Later, when it helps</Text>
      {teased.map(([feature, access]) => (
        <FeatureTeaserCard
          key={feature}
          ctaLabel="Start a session"
          description={access.lockedDescription}
          feature={feature}
          icon={HOME_FEATURE_COPY[feature].icon}
          onPress={() => onPress(feature)}
          progressLabel={access.recommendedUnlockMoment}
          stage={stage}
          title={HOME_FEATURE_COPY[feature].title}
          unlockLabel={access.unlockReason}
          whyItMatters={HOME_FEATURE_COPY[feature].why}
        />
      ))}
    </View>
  );
}
