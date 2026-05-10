/**
 * ComebackQuestCard Component
 *
 * Visual progress tracker for 3-session comeback quest chain.
 * Shows after user returns from 3+ day absence.
 *
 * @phase 11.4
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { type ComebackQuest, type ComebackQuestProgress, COMEBACK_QUEST_CONFIG } from '../ComebackQuestSystem';

interface ComebackQuestCardProps {
  /** Quest data */
  quest: ComebackQuest;
  /** Calculated progress */
  progress: ComebackQuestProgress;
  /** On start session pressed */
  onStartSession: () => void;
  /** On view details pressed */
  onViewDetails?: () => void;
}

/**
 * Quest step indicator
 */
function QuestStep({ step, title, description, isCompleted, isActive, requirements }: { step: number; title: string; description: string; isCompleted: boolean; isActive: boolean; requirements: { duration: number; grade?: string } }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      flexDirection="row"
      gap="md"
      p="md"
      borderRadius="lg"
      bg={isActive ? 'background.tertiary' : 'background.secondary'}
      style={{
        opacity: isCompleted ? 0.7 : 1,
        borderLeftWidth: 4,
        borderLeftColor: isCompleted ? theme.colors.success.DEFAULT : isActive ? theme.colors.primary[500] : theme.colors.border.light,
      }}
    >
      {/* Step Number */}
      <Box
        width={32}
        height={32}
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: isCompleted ? theme.colors.success.DEFAULT : isActive ? theme.colors.primary[500] : theme.colors.background.tertiary,
        }}
      >
        {isCompleted ? (
          <Text fontSize={16}>✓</Text>
        ) : (
          <Text variant="caption" color={isActive ? 'white' : 'text.tertiary'} fontWeight="700">
            {step}
          </Text>
        )}
      </Box>

      {/* Content */}
      <Box flex={1}>
        <Text variant="body" color={isActive ? 'text.primary' : 'text.secondary'} fontWeight={isActive ? '600' : '400'}>
          {title}
        </Text>
        <Text variant="caption" color="text.tertiary" mb="xs">
          {description}
        </Text>
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={12} color="text.tertiary">
            ⏱️ {requirements.duration}m
          </Text>
          {requirements.grade && (
            <Text fontSize={12} color="text.tertiary">
              • Grade {requirements.grade}+
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Phoenix badge preview
 */
function PhoenixBadgePreview(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      alignItems="center"
      p="lg"
      borderRadius="xl"
      style={{
        backgroundColor: `${theme.colors.warning.DEFAULT}15`,
        borderWidth: 2,
        borderColor: `${theme.colors.warning.DEFAULT}40`,
      }}
    >
      <Text fontSize={48} mb="sm">
        🔥
      </Text>
      <Text variant="body" color="text.primary" fontWeight="700" textAlign="center">
        Phoenix Rising Badge
      </Text>
      <Text variant="caption" color="text.secondary" textAlign="center">
        Complete all 3 quests to earn this exclusive badge + 250 coins
      </Text>
    </Box>
  );
}

/**
 * Progress bar
 */
function QuestProgressBar({ progress }: { progress: number }): JSX.Element {
  return (
    <Box gap="sm">
      <Box flexDirection="row" justifyContent="space-between">
        <Text variant="caption" color="text.secondary">
          Comeback Progress
        </Text>
        <Text variant="caption" color="primary.500" fontWeight="700">
          {Math.round(progress)}%
        </Text>
      </Box>

      <Box height={8} borderRadius="full" bg="background.tertiary">
        <Box height={8} borderRadius="full" bg="primary.500" style={{ width: `${progress}%` }} />
      </Box>
    </Box>
  );
}

/**
 * Main Comeback Quest Card
 */
export function ComebackQuestCard({ quest, progress, onStartSession, onViewDetails }: ComebackQuestCardProps): JSX.Element {
  const { theme } = useTheme();

  const isComplete = progress.currentStage === 'COMPLETE';
  const currentQuestNum = progress.currentStage === 'QUEST_1' ? 1 : progress.currentStage === 'QUEST_2' ? 2 : progress.currentStage === 'QUEST_3' ? 3 : 0;

  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Box gap="lg" p="lg">
        {/* Header */}
        <Box alignItems="center" gap="sm">
          <Text fontSize={48}>🔥</Text>
          <Text variant="h3" color="text.primary" textAlign="center">
            {isComplete ? 'Welcome Back!' : 'Comeback Quest'}
          </Text>
          <Text variant="body" color="text.secondary" textAlign="center">
            {isComplete ? 'You completed your comeback. The streak is back.' : `${quest.daysAbsent} days away. Your streak is gone but your skills are not. Do this one session. Rebuild from here.`}
          </Text>
        </Box>

        {/* Progress Bar */}
        <QuestProgressBar progress={progress.overallProgress} />

        {/* Quest Steps */}
        <Box gap="sm">
          <QuestStep step={1} title={COMEBACK_QUEST_CONFIG.quest1.name} description={COMEBACK_QUEST_CONFIG.quest1.description} isCompleted={progress.quest1.completed} isActive={currentQuestNum === 1} requirements={progress.quest1.required} />

          <QuestStep step={2} title={COMEBACK_QUEST_CONFIG.quest2.name} description={COMEBACK_QUEST_CONFIG.quest2.description} isCompleted={progress.quest2.completed} isActive={currentQuestNum === 2} requirements={progress.quest2.required} />

          <QuestStep step={3} title={COMEBACK_QUEST_CONFIG.quest3.name} description={COMEBACK_QUEST_CONFIG.quest3.description} isCompleted={progress.quest3.completed} isActive={currentQuestNum === 3} requirements={progress.quest3.required} />
        </Box>

        {/* Reward Preview */}
        {!isComplete && <PhoenixBadgePreview />}

        {/* Completed State */}
        {isComplete && (
          <Box p="lg" borderRadius="xl" bg="success.DEFAULT" alignItems="center" gap="sm">
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

        {/* CTA Button */}
        {!isComplete && (
          <Button variant="primary" size="lg" onPress={onStartSession} fullWidth accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
            {currentQuestNum === 1 ? '🚀 Start First Comeback Session' : currentQuestNum === 2 ? '⚡ Continue Your Comeback' : '🎯 Final Quest — You Got This!'}
          </Button>
        )}

        {isComplete && (
          <Button variant="primary" size="lg" onPress={onStartSession} fullWidth accessibilityLabel="✅ Start Your Next Session button" accessibilityRole="button" accessibilityHint="Activates this control">
            ✅ Start Your Next Session
          </Button>
        )}

        {/* View Details Link */}
        {onViewDetails && (
          <Pressable onPress={onViewDetails} accessibilityLabel="View Full Details → button" accessibilityRole="button" accessibilityHint="Activates this control">
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

/**
 * Compact comeback indicator for home screen
 */
export function ComebackQuestCompact({ progress, onPress }: { progress: ComebackQuestProgress; onPress: () => void }): JSX.Element {
  const { theme } = useTheme();

  const completedCount = (progress.quest1.completed ? 1 : 0) + (progress.quest2.completed ? 1 : 0) + (progress.quest3.completed ? 1 : 0);

  return (
    <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
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
            {progress.currentStage === 'QUEST_1' && 'First step: 15 min session'}
            {progress.currentStage === 'QUEST_2' && 'Step 2: 30 min, Grade A+'}
            {progress.currentStage === 'QUEST_3' && 'Final step: 45 min, Grade A+'}
            {progress.currentStage === 'COMPLETE' && 'All complete! Claim rewards'}
          </Text>
        </Box>
        <Text fontSize={20}>→</Text>
      </Box>
    </Pressable>
  );
}

export default ComebackQuestCard;
