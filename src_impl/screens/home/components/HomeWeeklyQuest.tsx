/**
 * HomeWeeklyQuest Component
 *
 * Renders the weekly quest card in the Home screen.
 */

import React from 'react';
import { WeeklyQuestCard } from '../../../features/weekly-quests/components/WeeklyQuestCard';

interface HomeWeeklyQuestProps {
  userId: string;
  onPress: () => void;
}

export function HomeWeeklyQuest({ userId, onPress }: HomeWeeklyQuestProps): JSX.Element {
  if (!userId) {return null;}

  return (
    <WeeklyQuestCard
      userId={userId}
      onPress={onPress}
    />
  );
}
