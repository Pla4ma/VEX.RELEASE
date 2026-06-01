import { View, useWindowDimensions } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { useFocusScoreHistory } from '../hooks-focus-score';
import {
  buildScaleX,
  buildScaleY,
  buildPathD,
  buildAreaD,
  getScoreColor,
  computeScoreBounds,
} from './chartHelpers';
import { ScoreChartSvg } from './ScoreChartSvg';

interface ScoreHistoryChartProps {
  userId: string;
  days?: number;
  height?: number;
  showGrid?: boolean;
}

export function ScoreHistoryChart({
  userId,
  days = 90,
  height = 200,
  showGrid = true,
}: ScoreHistoryChartProps) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { history, status } = useFocusScoreHistory(userId, days);
  const chartWidth = screenWidth - 48;
  const padding = { top: 20, right: 40, bottom: 30, left: 40 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const safeHistory = history ?? [];

  if (status === 'pending') {
    return (
      <Box
        padding="lg"
        backgroundColor="surface"
        borderRadius="lg"
        style={{ width: '100%' }}
      >
        <View
          style={{
            borderRadius: theme.spacing[2],
            backgroundColor: theme.colors.border.DEFAULT,
            height,
          }}
        />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        padding="lg"
        backgroundColor="surface"
        borderRadius="lg"
        style={{ width: '100%' }}
      >
        <Text
          variant="body"
          color="error"
          style={{ marginBottom: theme.spacing[4] }}
        >
          Score History
        </Text>
        <Text variant="caption" color="textMuted">
          Failed to load history
        </Text>
      </Box>
    );
  }

  if (safeHistory.length === 0) {
    return (
      <Box
        padding="lg"
        backgroundColor="surface"
        borderRadius="lg"
        style={{ width: '100%' }}
      >
        <Text
          variant="body"
          color="text"
          style={{ marginBottom: theme.spacing[4] }}
        >
          Score History
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing[2] }}>
            📊
          </Text>
          <Text variant="caption" color="textMuted">
            No score data yet. Complete sessions to build your history!
          </Text>
        </View>
      </Box>
    );
  }

  const { minScore, maxScore, scoreRange } = computeScoreBounds(safeHistory);
  const scaleX = buildScaleX(safeHistory.length, graphWidth, padding);
  const scaleY = buildScaleY(minScore, scoreRange, graphHeight, padding);
  const pathD = buildPathD(safeHistory, scaleX, scaleY);
  const areaD = buildAreaD(pathD, scaleX, safeHistory.length, padding, graphHeight);
  const latestScore = safeHistory[safeHistory.length - 1]?.score || 550;
  const scoreColor = getScoreColor(latestScore);

  return (
    <Box
      padding="lg"
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: '100%' }}
    >
      <Text variant="heading3" style={{ marginBottom: theme.spacing[4] }}>
        Score History
      </Text>

      <ScoreChartSvg
        history={safeHistory}
        chartWidth={chartWidth}
        height={height}
        graphWidth={graphWidth}
        graphHeight={graphHeight}
        padding={padding}
        minScore={minScore}
        maxScore={maxScore}
        scoreRange={scoreRange}
        scoreColor={scoreColor}
        scaleX={scaleX}
        scaleY={scaleY}
        pathD={pathD}
        areaD={areaD}
        showGrid={showGrid}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 12,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: scoreColor,
          }}
        />
        <Text variant="caption" color="textMuted">
          Current: {latestScore} ({safeHistory.length} days)
        </Text>
      </View>
    </Box>
  );
}
