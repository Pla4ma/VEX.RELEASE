import React, { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusScore } from './hooks-focus-score';
import { Box, Text, Stack, Button, Skeleton } from '@components/primitives';
import { useNetInfo } from '../../network';
import { useReducedMotion } from '../../hooks';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import type { FocusScoreHistoryPoint } from './types';

const FocusScoreDashboardSkeleton = () => {
  const { isReducedMotion } = useReducedMotion();
  const animate = !isReducedMotion;

  return (
    <Stack gap="md" testID="focus-score-dashboard-skeleton">
      <Box>
        <Skeleton width={100} height={20} animated={animate} />
        <Skeleton width={80} height={30} animated={animate} />
        <Skeleton width={120} height={16} animated={animate} />
      </Box>

      <Box>
        <Skeleton width="100%" height={150} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={120} height={20} animated={animate} />
        <Skeleton width="100%" height={16} animated={animate} />
      </Box>

      <Box>
        <Skeleton width={120} height={20} animated={animate} />
        <Skeleton
          width="100%"
          height={40}
          variant="rounded"
          animated={animate}
        />
      </Box>
    </Stack>
  );
};

function formatDelta(delta: number): string {
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

function formatFactorName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function formatHistoryPoint(point: FocusScoreHistoryPoint): string {
  const date = new Date(point.timestamp);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}: ${point.score} (${formatDelta(point.delta)})`;
}

export const FocusScoreDashboard = withScreenErrorBoundary(function _FocusScoreDashboard(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { score, history, status, error, refetch, isRefetching } = useFocusScore();
  const { isOffline } = useNetInfo();

  if (status === 'pending') {
    return <FocusScoreDashboardSkeleton />;
  }

  if (status === 'error') {
    return (
      <Box p="md" gap="md" alignItems="center">
        <Text color="error">Error: {error?.message}</Text>
        <Button onPress={() => void (refetch)()} variant="primary">
          Retry
        </Button>
      </Box>
    );
  }

  if (isOffline) {
    return (
      <Box p="md" bg="warning" borderRadius="md" mb="md" alignItems="center">
        <Text color="onWarning">You are offline. Data may be outdated.</Text>
      </Box>
    );
  }

  if (!score) {
    return (
      <Box p="md">
        <Text>Start your first session to see your Focus Score.</Text>
      </Box>
    );
  }

  const {
    currentScore,
    band,
    lastChangeReason,
    factors,
    previousScore,
    topPositiveFactor,
    topNegativeFactor,
  } =
    score;
  const delta = currentScore - previousScore;
  const positiveFactor = topPositiveFactor ? factors[topPositiveFactor] : null;
  const negativeFactor = topNegativeFactor ? factors[topNegativeFactor] : null;

  return (
    <Box p="md">
      <Stack gap="md">
        <Box>
          <Text variant="h3">Focus Score</Text>
          <Text variant="h1">{currentScore}</Text>
          <Text variant="h4">{band}</Text>
          <Text color={delta >= 0 ? 'success' : 'error'}>
            {formatDelta(delta)} since last session
          </Text>
          {isRefetching && (
            <Text color="textMuted" variant="caption">
              Updating...
            </Text>
          )}
        </Box>

        <Box>
          <Text variant="h4" mb="sm">
            30-day trend
          </Text>
          <Stack gap="sm">
            {history && history.length > 0 ? (
              history.slice(-5).map((point, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <Text>{formatHistoryPoint(point)}</Text>
                </Box>
              ))
            ) : (
              <Text>No history available yet.</Text>
            )}
          </Stack>
        </Box>

        <Box>
          <Text variant="h4" mb="sm">
            Factors
          </Text>
          {Object.entries(factors).map(([key, factor]) => (
            <Box key={key} mb="xs">
              <Text variant="bodySmall">{key}</Text>
              <Box height={8} bg="border" borderRadius="full" overflow="hidden">
                <Box
                  height="100%"
                  bg="primary"
                  style={{ width: `${factor.score}%` }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box>
          <Text variant="h4" mb="sm">
            What Changed
          </Text>
          <Text>{lastChangeReason}</Text>
          {positiveFactor && <Text>{`Strongest: ${positiveFactor.explanation}`}</Text>}
          {negativeFactor && <Text>{`Weakest: ${negativeFactor.explanation}`}</Text>}
        </Box>

        <Box>
          <Button
            onPress={() =>
              navigation.navigate('Analytics', {
                month: new Date().toISOString().slice(0, 7),
              })
            }
            variant="secondary"
          >
            View Monthly Report
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}, 'Focus Dashboard');
