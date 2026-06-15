import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function QuestStep({
  step,
  title,
  description,
  isCompleted,
  isActive,
  requirements,
}: {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  requirements: { duration: number; grade?: string };
}): React.ReactNode {
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
        borderLeftColor: isCompleted
          ? theme.colors.success.DEFAULT
          : isActive
            ? theme.colors.primary[500]
            : theme.colors.border.light,
      }}
    >
      {}
      <Box
        width={32}
        height={32}
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: isCompleted
            ? theme.colors.success.DEFAULT
            : isActive
              ? theme.colors.primary[500]
              : theme.colors.background.tertiary,
        }}
      >
        {isCompleted ? (
          <Text fontSize={16}>✓</Text>
        ) : (
          <Text
            variant="caption"
            color={isActive ? 'white' : 'text.tertiary'}
            fontWeight="700"
          >
            {step}
          </Text>
        )}
      </Box>

      {}
      <Box flex={1}>
        <Text
          variant="body"
          color={isActive ? 'text.primary' : 'text.secondary'}
          fontWeight={isActive ? '600' : '400'}
        >
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

export function PhoenixBadgePreview(): React.ReactNode {
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
      <Text
        variant="body"
        color="text.primary"
        fontWeight="700"
        textAlign="center"
      >
        Phoenix Rising Badge
      </Text>
      <Text variant="caption" color="text.secondary" textAlign="center">
        Complete all 3 quests to earn this exclusive badge + 250 coins
      </Text>
    </Box>
  );
}

export function QuestProgressBar({ progress }: { progress: number }): React.ReactNode {
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
        <Box
          height={8}
          borderRadius="full"
          bg="primary.500"
          style={{ width: `${progress}%` }}
        />
      </Box>
    </Box>
  );
}
