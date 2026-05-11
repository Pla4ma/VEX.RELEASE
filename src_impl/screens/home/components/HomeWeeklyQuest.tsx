/**
 * HomeWeeklyQuest Component
 *
 * Renders the weekly quest card in the Home screen.
 */

import React from 'react';
import { useFeatureGate } from '../../../features/feature-gate/hooks';
import { WeeklyQuestCard } from '../../../features/weekly-quests/components/WeeklyQuestCard';

interface HomeWeeklyQuestProps {
  userId: string;
  onPress: () => void;
}

export function HomeWeeklyQuest({ userId, onPress }: HomeWeeklyQuestProps): JSX.Element | null {
  const { isVisible } = useFeatureGate('challenges');

  if (!userId || !isVisible) {
    return null;
  }

  return (
    <WeeklyQuestCard
      userId={userId}
      onPress={onPress}
    />
  );
}
