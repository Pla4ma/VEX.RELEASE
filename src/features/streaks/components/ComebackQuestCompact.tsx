import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { buttonTap } from '../../../utils/haptics';
import type { ComebackQuestProgress } from '../ComebackQuestSystem';

export function ComebackQuestCompact({
  progress,
  onPress,
}: {
  progress: ComebackQuestProgress;
  onPress: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  const completedCount =
    (progress.quest1.completed ? 1 : 0) +
    (progress.quest2.completed ? 1 : 0) +
    (progress.quest3.completed ? 1 : 0);
  return (
    <Pressable
      onPress={() => { buttonTap(); onPress(); }}
      accessibilityLabel={`Comeback quest: ${completedCount} of 3 complete`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view comeback quest details"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="md"
        p="md"
        borderRadius="lg"
        style={{
          backgroundColor: `${theme.colors.warning.DEFAULT}15`,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.warning.DEFAULT,
        }}
      >
        <Text fontSize={24}>🔥</Text>
        <Box flex={1}>
          <Text variant="body" color="text.primary" fontWeight="600">
            Comeback Quest: {completedCount}/3 Complete
          </Text>
          <Text variant="caption" color="text.secondary">
            {progress.currentStage === 'QUEST_1' &&
              'First step: 15 min session'}
            {progress.currentStage === 'QUEST_2' && 'Step 2: 30 min, Grade A+'}
            {progress.currentStage === 'QUEST_3' &&
              'Final step: 45 min, Grade A+'}
            {progress.currentStage === 'COMPLETE' &&
              'All complete! Claim rewards'}
          </Text>
        </Box>
        <Text fontSize={20}>→</Text>
      </Box>
    </Pressable>
  );
}
