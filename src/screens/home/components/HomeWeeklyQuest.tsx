import React from 'react';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../../features/liveops-config';
import type { FeatureAccessMap } from '../../../features/liveops-config';
import { WeeklyQuestCard } from '../../../features/weekly-quests/components/WeeklyQuestCard';

interface HomeWeeklyQuestProps {
  features: FeatureAccessMap;
  onPress: () => void;
  onOpenSetup: () => void;
  userId: string;
}

export function HomeWeeklyQuest({ features, onPress, onOpenSetup, userId }: HomeWeeklyQuestProps): JSX.Element | null {
  const availability = getFeatureAvailability(features.challenges);

  if (!userId || !availability.canRenderEntryPoint) {
    return null;
  }

  const handlePress = (): void => {
    if (isFeatureAvailableForNavigation(availability)) {
      onPress();
      return;
    }
    onOpenSetup();
  };

  return (
    <WeeklyQuestCard
      userId={userId}
      onPress={handlePress}
    />
  );
}
