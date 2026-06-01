import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import type { SessionSummary } from '../../../session/types';
import { useTheme } from '../../../theme';

type SessionCompletionFollowThroughProps = {
  summary: SessionSummary;
};

type ChallengeLine = {
  id: string;
  label: string;
  value: string;
};

function buildChallengeLines(summary: SessionSummary): ChallengeLine[] {
  const lines: ChallengeLine[] = [];

  if (summary.tasksPlanned && summary.tasksCompleted !== undefined) {
    lines.push({
      id: 'tasks',
      label: 'Planned work',
      value: `${summary.tasksCompleted}/${summary.tasksPlanned}`,
    });
  }
  if (summary.streakIncreased) {
    lines.push({ id: 'streak', label: 'Streak challenge', value: '+1 day' });
  }
  if (summary.completionPercentage >= 100) {
    lines.push({
      id: 'completion',
      label: 'Completion challenge',
      value: 'Cleared',
    });
  }

  return lines;
}

function FollowThroughCard({
  children,
  delay,
  title,
}: {
  children: React.ReactNode;
  delay: number;
  title: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(360)}>
      <Box
        p={18}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderWidth: 1,
          ...getPremiumCardStyle('medium'),
        }}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          {title}
        </Text>
        {children}
      </Box>
    </Animated.View>
  );
}

export function SessionCompletionFollowThrough({
  summary,
}: SessionCompletionFollowThroughProps): JSX.Element {
  const { theme } = useTheme();
  const [challengesExpanded, setChallengesExpanded] = useState(false);
  const challengeLines = useMemo(() => buildChallengeLines(summary), [summary]);
  const bossDamage = summary.damage?.totalDamage ?? 0;
  const tomorrowFocusMinutes = Math.max(
    15,
    Math.floor(summary.effectiveDuration / 120),
  );

  return (
    <Box px={6} pt={5} gap={4}>
      <FollowThroughCard delay={120} title="CHALLENGE PROGRESS">
        <Pressable
          accessibilityHint="Expands or collapses compact challenge progress."
          accessibilityLabel="Toggle session challenge progress"
          accessibilityRole="button"
          onPress={() => setChallengesExpanded((current) => !current)}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mt={3}
          >
            <Text
              variant="body"
              color={theme.colors.text.primary}
              fontWeight="700"
            >
              {challengeLines.length > 0
                ? `${challengeLines.length} updates ready`
                : 'No challenge changes from this run'}
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              {challengesExpanded ? 'Collapse' : 'Review'}
            </Text>
          </Box>
        </Pressable>
        {challengesExpanded ? (
          <Box mt={4} gap={3}>
            {challengeLines.length > 0 ? (
              challengeLines.map((line) => (
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                  key={line.id}
                >
                  <Text variant="bodySmall" color={theme.colors.text.secondary}>
                    {line.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    color={theme.colors.text.primary}
                    fontWeight="800"
                  >
                    {line.value}
                  </Text>
                </Box>
              ))
            ) : (
              <Text variant="bodySmall" color={theme.colors.text.secondary}>
                Finish another focused run to push active challenges forward.
              </Text>
            )}
          </Box>
        ) : null}
      </FollowThroughCard>

      {bossDamage > 0 ? (
        <FollowThroughCard delay={220} title="BOSS DAMAGE">
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
          >
            <Text variant="body" color={theme.colors.text.secondary}>
              Pressure applied
            </Text>
            <Text variant="h3" color={theme.colors.error.DEFAULT}>
              {bossDamage}
            </Text>
          </Box>
        </FollowThroughCard>
      ) : null}

      <FollowThroughCard delay={320} title="TOMORROW PREVIEW">
        <Text variant="h4" color={theme.colors.text.primary} mt={3}>
          Bank one {tomorrowFocusMinutes}-minute run.
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt={2}>
          Your streak momentum is warm. Tomorrow's first win should be short,
          clean, and early.
        </Text>
      </FollowThroughCard>
    </Box>
  );
}

export default SessionCompletionFollowThrough;
