import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import type { HomeController } from '../hooks/home-controller-types';
import {
  HomeExperiencePrelude,
} from '../../../features/home-experience/components/HomeExperiencePrelude';
import type { HomeSurfaceMap } from '../../../features/home-experience/components/HomeExperiencePrelude';
import type { FirstWeekExperience } from '../../../features/personalization/first-week-schemas';
import type { VexExperience } from '../../../features/personalization/schemas';
import { useHomeExperienceModel } from '../../../features/home-experience/components/HomeExperiencePrelude';
import { type } from '../../reference-ui/referenceTokens';

function cardPressStyle(pressed: boolean) {
  return {
    opacity: pressed ? 0.9 : 1,
    transform: [{ scale: pressed ? 0.985 : 1 }],
  } as const;
}

interface HomeContinueCardProps {
  controller: HomeController;
  completedSessions: number;
  surfaceMap?: HomeSurfaceMap;
  resolvedExperience?: VexExperience;
  firstWeekExperience?: FirstWeekExperience;
}

export function HomeContinueCard({
  controller,
  completedSessions,
  surfaceMap,
  resolvedExperience,
  firstWeekExperience,
}: HomeContinueCardProps): React.ReactNode {
  const homeExperience = useHomeExperienceModel(
    completedSessions,
    resolvedExperience,
    firstWeekExperience,
  );

  return (
    <Pressable
      accessibilityHint="Resume your last project session"
      accessibilityLabel="Continue where you left off"
      accessibilityRole="button"
      onPress={() => controller.openSetup()}
      style={({ pressed }) => cardPressStyle(pressed)}
    >
      <ReferenceCard accent="fire" showAsset={false}>
        <Text style={type.title}>Continue where you left off</Text>
        <Text style={[type.body, { marginTop: 6 }]}>
          Project Atlas opened 2h ago.
        </Text>
        <View style={{ marginTop: 10 }}>
          <HomeExperiencePrelude
            model={homeExperience}
            firstWeekExperience={firstWeekExperience}
            surfaceMap={surfaceMap}
          />
        </View>
      </ReferenceCard>
    </Pressable>
  );
}
