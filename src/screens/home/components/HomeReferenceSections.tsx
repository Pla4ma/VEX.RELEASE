import React from 'react';
import { View } from 'react-native';
import { AiCoachCard } from './AiCoachCard';
import { StreakCard } from './StreakCard';
import { FocusScoreCard, FocusMemoryCard } from './FocusCards';
import { ProjectAtlasCard } from './ProjectAtlasCard';

interface HomeReferenceSectionsProps {
  currentStreak: number;
  onStartSession: () => void;
  totalSessions: number;
}

export function HomeReferenceSections({
  currentStreak,
}: HomeReferenceSectionsProps): JSX.Element {
  return (
    <View style={{ gap: 10, marginTop: 12 }}>
      <AiCoachCard />
      <StreakCard currentStreak={currentStreak} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <FocusScoreCard />
        <FocusMemoryCard />
      </View>
      <ProjectAtlasCard />
    </View>
  );
}

export default HomeReferenceSections;
