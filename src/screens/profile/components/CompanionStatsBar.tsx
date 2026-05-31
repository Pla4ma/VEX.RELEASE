import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box, Card, Text } from '../../../components/primitives';
import {
  type CompanionMood,
  type CompanionState,
  ELEMENT_THEMES,
} from '../../../features/companion/types';
import {
  ELEMENT_LORE,
  MoodDot,
  PhaseProgressBar,
  ProgressToNext,
  StatCard,
} from './CompanionScreenSupport';

export interface SessionMoodEntry {
  mood: CompanionMood;
  sessionId: string;
  timestamp: number;
}

interface CompanionStatsBarProps {
  companion: CompanionState;
  moodHistory: SessionMoodEntry[];
  reducedMotion: boolean;
}

export function CompanionStatsBar({
  companion,
  moodHistory,
  reducedMotion,
}: CompanionStatsBarProps): JSX.Element {
  const themeColors = ELEMENT_THEMES[companion.element];
  const fadeUp = (delay: number) =>
    reducedMotion ? undefined : FadeInUp.duration(400).delay(delay);

  return (
    <>
      <Animated.View entering={fadeUp(200)}>
        <Box px="lg" py="xl" gap="lg">
          <Text variant="h3" color="text.primary">
            Companion Stats
          </Text>
          <Box flexDirection="row" gap="md">
            <StatCard
              label="Focus Minutes"
              value={Math.floor(companion.totalFocusMinutes).toLocaleString()}
            />
            <StatCard
              label="Sessions Together"
              value={companion.sessionCount.toLocaleString()}
            />
            <StatCard
              label="Perfect Sessions"
              value={companion.perfectSessions.toLocaleString()}
            />
          </Box>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(300)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Evolution Progress
          </Text>
          <Card size="md">
            <Box gap="md">
              <PhaseProgressBar currentPhase={companion.phase} />
              <Text variant="body" color="text.secondary">
                Level {companion.level}/100
              </Text>
              <ProgressToNext companion={companion} />
            </Box>
          </Card>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(400)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Element Affinity
          </Text>
          <Card
            size="md"
            style={{ borderColor: themeColors.primary, borderWidth: 1 }}
          >
            <Text variant="h4" color="text.primary" fontWeight="600">
              {companion.element}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Affinity: {companion.elementAffinity}%
            </Text>
            <Text variant="bodySmall" color="text.secondary">
              {ELEMENT_LORE[companion.element]}
            </Text>
          </Card>
        </Box>
      </Animated.View>
      <Animated.View entering={fadeUp(500)}>
        <Box px="lg" pb="xl" gap="md">
          <Text variant="h3" color="text.primary">
            Session History
          </Text>
          <Card size="md">
            <Box gap="md">
              <Text variant="bodySmall" color="text.secondary">
                Last {moodHistory.length} session
                {moodHistory.length === 1 ? '' : 's'}
              </Text>
              <Box flexDirection="row" gap="sm" alignItems="center">
                {moodHistory.length > 0 ? (
                  moodHistory.map((entry) => (
                    <MoodDot key={entry.sessionId} mood={entry.mood} />
                  ))
                ) : (
                  <Text variant="caption" color="text.tertiary">
                    No recent sessions recorded
                  </Text>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      </Animated.View>
    </>
  );
}
