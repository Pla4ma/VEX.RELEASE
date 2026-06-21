import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import {
  type ComebackQuest,
  type ComebackQuestProgress,
  COMEBACK_QUEST_CONFIG,
} from '../ComebackQuestSystem';
import {
  QuestStep,
  PhoenixBadgePreview,
  QuestProgressBar,
} from './ComebackQuestSubcomponents';
import { Text as VexText } from '../../../components/primitives/Text';

export interface ComebackQuestCardProps {
  quest: ComebackQuest;
  progress: ComebackQuestProgress;
  onStartSession: () => void;
  onViewDetails?: () => void;
}

export function ComebackQuestCard({
  quest,
  progress,
  onStartSession,
  onViewDetails,
}: ComebackQuestCardProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  const isComplete = progress.currentStage === 'COMPLETE';
  const currentQuestNum =
    progress.currentStage === 'QUEST_1'
      ? 1
      : progress.currentStage === 'QUEST_2'
        ? 2
        : progress.currentStage === 'QUEST_3'
          ? 3
          : 0;
  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Box gap="lg" p="lg">
        {}
        <Box alignItems="center" gap="sm">
          <Text fontSize={48}>🔥</Text>
          <Text variant="h3" color="text.primary" textAlign="center">
            {isComplete ? 'Welcome Back!' : 'Comeback Quest'}
          </Text>
          <Text variant="body" color="text.secondary" textAlign="center">
            {isComplete
              ? 'You completed your comeback. The streak is back.'
              : `${quest.daysAbsent} days away. Your streak is gone but your skills are not. Do this one session. Rebuild from here.`}
          </Text>
        </Box>

        {}
        <QuestProgressBar progress={progress.overallProgress} />

        {}
        <Box gap="sm">
          <QuestStep
            step={1}
            title={COMEBACK_QUEST_CONFIG.quest1.name}
            description={COMEBACK_QUEST_CONFIG.quest1.description}
            isCompleted={progress.quest1.completed}
            isActive={currentQuestNum === 1}
            requirements={progress.quest1.required}
          />

          <QuestStep
            step={2}
            title={COMEBACK_QUEST_CONFIG.quest2.name}
            description={COMEBACK_QUEST_CONFIG.quest2.description}
            isCompleted={progress.quest2.completed}
            isActive={currentQuestNum === 2}
            requirements={progress.quest2.required}
          />

          <QuestStep
            step={3}
            title={COMEBACK_QUEST_CONFIG.quest3.name}
            description={COMEBACK_QUEST_CONFIG.quest3.description}
            isCompleted={progress.quest3.completed}
            isActive={currentQuestNum === 3}
            requirements={progress.quest3.required}
          />
        </Box>

        {}
        {!isComplete && <PhoenixBadgePreview />}

        {}
        {isComplete && (
          <Box
            p="lg"
            borderRadius="xl"
            bg="success.DEFAULT"
            alignItems="center"
            gap="sm"
          >
            <Text fontSize={32}>🎉</Text>
            <Text variant="h4" color="white" textAlign="center">
              Quest Complete!
            </Text>
            <Text variant="body" color="white" textAlign="center">
              You earned the Phoenix Rising badge + 250 coins
            </Text>
            <Text variant="caption" color="white">
              Your streak has been restored to Day 1
            </Text>
          </Box>
        )}
        {!isComplete && (
          <Button
            variant="primary"
            size="lg"
            onPress={onStartSession}
            fullWidth
            accessibilityLabel="Perform action"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>
              {currentQuestNum === 1
              ? '🚀 Start First Comeback Session'
              : currentQuestNum === 2
                ? '⚡ Continue Your Comeback'
                : '🎯 Final Quest — You Got This!'}
            </VexText>
          </Button>
        )}

        {isComplete && (
          <Button variant="primary"
            size="lg"
            onPress={onStartSession}
            fullWidth
            accessibilityLabel="Start your next session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>? Start Your Next Session</VexText>
          </Button>
        )}

        {onViewDetails && (
          <Pressable
            onPress={onViewDetails}
            accessibilityLabel="View full quest details"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Box alignItems="center">
              <Text variant="body" color="primary.500">
                View Full Details →
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>
    </Animated.View>
  );
}

export { ComebackQuestCompact } from './ComebackQuestCompact';
export default ComebackQuestCard;
