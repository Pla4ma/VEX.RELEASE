/**
 * HomeDailyMission Component
 *
 * Renders the primary daily mission card in the Home screen.
 * Part of Phase 3 Information Architecture - position 2.
 */

import React from 'react';
import { DailyMissionCard } from '../../../features/daily-mission/components/DailyMissionCard';
import { useDailyMission, useDailyMissionAnalytics } from '../../../features/daily-mission/hooks';
import { trackMissionShown } from '../../../features/daily-mission/analytics';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';

interface HomeDailyMissionProps {
  missionInput: Partial<MissionPriorityInput>;
  onMissionPress?: () => void;
}

export function HomeDailyMission({
  missionInput,
  onMissionPress,
}: HomeDailyMissionProps): JSX.Element {
  const { theme } = useTheme();
  const { mission, missionType, remainingHours, isExpired } = useDailyMission(missionInput);
  const analytics = useDailyMissionAnalytics(mission);

  // Track mission shown when it changes
  React.useEffect(() => {
    if (mission && !isExpired) {
      trackMissionShown(mission);
    }
  }, [mission, isExpired]);

  // Empty state when no mission
  if (!mission || isExpired) {
    return (
      <Box
        m="lg"
        p="lg"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
        borderWidth={1}
        borderColor={theme.colors.border.light}
        alignItems="center"
        gap="sm"
        py="md"
      >
        <Text fontSize={32}>🎯</Text>
        <Text variant="bodySmall" color="text.secondary" textAlign="center">
          No active mission right now
        </Text>
        <Text variant="caption" color="text.tertiary">
          Check back later for your next focus goal
        </Text>
      </Box>
    );
  }

  return (
    <DailyMissionCard
      mission={mission}
      onPress={onMissionPress}
    />
  );
}