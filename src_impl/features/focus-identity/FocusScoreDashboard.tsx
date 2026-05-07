
import React from 'react';
import { useNavigation } from '@react-navigation/native'; // Add this import
import { useFocusScore } from './hooks-focus-score';
import { Box, Text, Stack, Button } from '@components/primitives';
import { useTheme } from '@theme';
import { useReducedMotion } from '@hooks';
import { useNetInfo } from '@network';

const FocusScoreDashboardSkeleton = () => {
  const { isReducedMotion } = useReducedMotion(); // Use the hook
  const animate = !isReducedMotion;

  return (
    <Stack space="m" testID="focus-score-dashboard-skeleton">
      <Box>
        <Skeleton width={100} height={20} animate={animate} />
        <Skeleton width={80} height={30} animate={animate} />
        <Skeleton width={120} height={16} animate={animate} />
        <Skeleton width={60} height={16} animate={animate} />
      </Box>

      <Box>
        <Skeleton width="100%" height={150} animate={animate} /> {/* For 30-day trend */}
      </Box>

      <Box>
        <Skeleton width={150} height={20} animate={animate} />
        <Stack space="s">
          <Skeleton width="100%" height={16} animate={animate} />
          <Skeleton width="90%" height={16} animate={animate} />
          <Skeleton width="80%" height={16} animate={animate} />
          <Skeleton width="70%" height={16} animate={animate} />
          <Skeleton width="60%" height={16} animate={animate} />
        </Stack>
      </Box>

      <Box>
        <Skeleton width={120} height={20} animate={animate} />
        <Skeleton width="100%" height={16} animate={animate} />
      </Box>

      <Box>
        <Skeleton width={100} height={20} animate={animate} />
        <Skeleton width={80} height={16} animate={animate} />
      </Box>

      <Box>
        <Skeleton width={120} height={20} animate={animate} />
        <Skeleton width="100%" height={40} variant="rounded" animate={animate} />
      </Box>
    </Stack>
  );
};

export const FocusScoreDashboard = () => {
  const navigation = useNavigation(); // Add this line
  const { score, history, status, error, refetch, isRefetching } = useFocusScore();
  const { theme } = useTheme();
  const { isOffline } = useNetInfo(); // Use the hook

  if (status === 'pending') {
    return <FocusScoreDashboardSkeleton />;
  }

  if (status === 'error') {
    return (
      <Box p="m" space="m" alignItems="center">
        <Text color="error">Error: {error?.message}</Text>
        <Button onPress={() => refetch()} variant="primary">Retry</Button>
      </Box>
    );
  }

  // Offline banner
  if (isOffline) {
    return (
      <Box p="m" bg="warning" borderRadius="m" mb="m" alignItems="center">
        <Text color="onWarning">You are offline. Data may be outdated.</Text>
      </Box>
    );
  }

  if (!score) {
    return (
      <Box>
        <Text>Start your first session to see your Focus Score.</Text>
      </Box>
    );
  }

  const { currentScore, band, lastChangeReason, factors, previousScore } = score;
  const delta = currentScore - previousScore;

  return (
    <Box p="m">
      <Stack space="m">
        <Box>
          <Text>Focus Score</Text>
          <Text>{currentScore}</Text>
          <Text>{band}</Text>
          <Text>+{delta}</Text>
          {status === 'success' && isRefetching && (
            <Text color="textSecondary" fontSize="xs">Updating...</Text>
          )}
        </Box>

        <Box>
          <Text>30-day trend</Text>
          <Stack space="s">
            {history && history.length > 0 ? (
              history.slice(-30).map((point, index) => (
                <Text key={index}>
                  {new Date(point.timestamp).toLocaleDateString()}: {point.score} ({point.delta > 0 ? '+' : ''}{point.delta})
                </Text>
              ))
            ) : (
              <Text>No history available yet.</Text>
            )}
          </Stack>
        </Box>

        <Box>
          <Text>Five factor bars</Text>
          {Object.entries(factors).map(([key, factor]) => (
            <Box key={key}>
              <Text>{key}</Text>
              <Text>{factor.score}</Text>
            </Box>
          ))}
        </Box>

        <Box>
          <Text>What Changed</Text>
          <Text>{lastChangeReason}</Text>
          {score.topPositiveFactor && (
            <Text>Strongest: {score.factors[score.topPositiveFactor].explanation}</Text>
          )}
          {score.topNegativeFactor && (
            <Text>Weakest: {score.factors[score.topNegativeFactor].explanation}</Text>
          )}
        </Box>

        <Box>
          <Text>Next Score Target</Text>
          {/* Logic to determine next target */}
          <Text>Reach {Math.min(850, Math.floor(currentScore / 10) * 10 + 10)}</Text>
        </Box>

        <Box>
          <Text>Monthly Report</Text>
          <Button
            onPress={() => navigation.navigate('Analytics', { month: new Date().toISOString().slice(0, 7) })}
            variant="secondary"
          >
            View Monthly Report
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
