import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import type { Theme } from '../../../theme';
import { ScoreOverviewCard } from './ScoreOverviewCard';
import { Text as VexText } from '../../../components/primitives/Text';

interface ScoreDriver {
  name: string;
  value: string;
}

interface ReportCardsProps {
  theme: Theme;
  month: string;
  endingScore: number;
  grade: string;
  change: number;
  scoreColor: string;
  scoreDrivers: ScoreDriver[];
  sessionsCompleted: number;
  highlight: string;
  percentile: number;
  identityStatement: string;
  onShare: () => void;
  onClose: () => void;
}

export function ReportCards({
  theme,
  month,
  endingScore,
  grade,
  change,
  scoreColor,
  scoreDrivers,
  sessionsCompleted,
  highlight,
  percentile,
  identityStatement,
  onShare,
  onClose,
}: ReportCardsProps): React.ReactNode {
  return (
    <>
      <ScoreOverviewCard
        theme={theme}
        month={month}
        endingScore={endingScore}
        grade={grade}
        change={change}
        scoreColor={scoreColor}
      />

      {/* Score drivers card */}
      {scoreDrivers.length > 0 && (
        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          <Box
            backgroundColor="surface"
            borderRadius="xl"
            padding="xl"
            style={{ marginBottom: theme.spacing[6] }}
          >
            <Text
              variant="heading3"
              color="text"
              style={{ marginBottom: theme.spacing[4] }}
            >
              Score Drivers
            </Text>
            <View style={{ gap: theme.spacing[3] }}>
              {scoreDrivers.map((driver, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="body" color="text">
                    {driver.name}
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      fontWeight: '600',
                      color: driver.value.startsWith('+')
                        ? theme.colors.success.DEFAULT
                        : theme.colors.error.DEFAULT,
                    }}
                  >
                    {driver.value}
                  </Text>
                </View>
              ))}
            </View>
          </Box>
        </Animated.View>
      )}

      {/* Month highlights card */}
      <Animated.View entering={FadeIn.delay(300).duration(300)}>
        <Box
          backgroundColor="surface"
          borderRadius="xl"
          padding="xl"
          style={{ marginBottom: theme.spacing[6] }}
        >
          <Text
            variant="heading3"
            color="text"
            style={{ marginBottom: theme.spacing[4] }}
          >
            Month Highlights
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginBottom: theme.spacing[2] }}
          >
            Sessions completed: {sessionsCompleted}
          </Text>
          <Text variant="body" color="textSecondary">
            {highlight}
          </Text>
        </Box>
      </Animated.View>

      {/* Focus identity card */}
      <Animated.View entering={FadeIn.delay(400).duration(300)}>
        <Box
          backgroundColor="surface"
          borderRadius="xl"
          padding="xl"
          style={{ marginBottom: theme.spacing[6] }}
        >
          <Text
            variant="heading3"
            color="text"
            style={{ marginBottom: theme.spacing[4] }}
          >
            Your Focus Identity
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginBottom: theme.spacing[3] }}
          >
            You're in the top {100 - percentile}% of focused people
          </Text>
          <Text
            variant="body"
            color="text"
            style={{ fontStyle: 'italic', lineHeight: 24 }}
          >
            {identityStatement}
          </Text>
        </Box>
      </Animated.View>

      {/* Share / Close buttons */}
      <Animated.View entering={SlideInDown.delay(500).duration(300)}>
        <Button
          onPress={onShare}
          variant="primary"
          style={{ marginBottom: theme.spacing[4] }}
        >
          <VexText>Share Monthly Report</VexText>
        </Button>
        <Button accessibilityLabel="Close" onPress={onClose} variant="secondary">
          <Text>Close</Text>
        </Button>
      </Animated.View>
    </>
  );
}
