import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

type Challenge = NonNullable<
  import('../../../features/mastery/types').MasteryState['activeChallenges']
>[number];

export function ActiveChallenges({
  challenges,
}: {
  challenges: Challenge[];
}): JSX.Element | null {
  const { theme: _theme } = useTheme();

  if (challenges.length === 0) {return null;}

  return (
    <Box px="lg" mt="lg">
      <Text variant="label" mb="sm">
        Active Challenges
      </Text>
      <Box gap="sm">
        {challenges.map((challenge) => (
          <Box
            key={challenge.id}
            p="md"
            bg="background.secondary"
            borderRadius="lg"
            style={{
              borderWidth: 1,
              borderColor: vexFire.border,
            }}
          >
            <Text variant="body" color={vexFire.cream}>
              {challenge.title}
            </Text>
            <Text variant="caption" color={vexFire.textSecondary} mt="xs">
              Complete this session to progress
            </Text>
            <Text variant="label" color={vexFire.ember} mt="sm">
              {`+${challenge.masteryPoints} XP`}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
