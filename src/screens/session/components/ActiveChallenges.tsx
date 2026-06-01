import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

type Challenge = NonNullable<
  import('../../../features/mastery/types').MasteryState['activeChallenges']
>[number];

export function ActiveChallenges({
  challenges,
}: {
  challenges: Challenge[];
}): JSX.Element | null {
  const { theme } = useTheme();

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
              borderColor: theme.colors.border.light,
            }}
          >
            <Text variant="body" color="text.primary">
              {challenge.title}
            </Text>
            <Text variant="caption" color="text.secondary" mt="xs">
              Complete this session to progress
            </Text>
            <Text variant="label" color="primary.500" mt="sm">
              {`+${challenge.masteryPoints} XP`}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
