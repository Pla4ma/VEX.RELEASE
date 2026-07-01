const padding = { top: 20, right: 40, bottom: 30, left: 40 };

import { View, useWindowDimensions } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { GlassCard } from '../../../components/glass/GlassCard';
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
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
}: ScoreHistoryChartProps): React.ReactNode {
  const { width: screenWidth } = useWindowDimensions();
  const { history, status } = useFocusScoreHistory(userId, days);
  const chartWidth = screenWidth - 48;
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const safeHistory = history ?? [];

  if (status === 'pending') {
    return (
      <GlassCard variant="default" size="lg" padding={18} radius={26}>
        <View
          style={{
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
            borderRadius: 14,
            height,
          }}
        />
      </GlassCard>
    );
  }

  if (status === 'error') {
    return (
      <GlassCard variant="default" size="lg" padding={18} radius={26}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '800',
            marginBottom: 6,
          }}
        >
          Score History
        </Text>
        <Text
          style={{
            color: vexLightGlass.semantic.danger,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          Failed to load history
        </Text>
      </GlassCard>
    );
  }

  if (safeHistory.length === 0) {
    return (
      <GlassCard variant="default" size="lg" padding={18} radius={26}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '800',
            marginBottom: 12,
          }}
        >
          Score History
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text
            style={{
              color: vexLightGlass.text.tertiary,
              fontSize: 12,
            }}
          >
            No score data yet. Complete sessions to build your history.
          </Text>
        </View>
      </GlassCard>
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
    <GlassCard variant="default" size="lg" padding={18} radius={26}>
      <Box style={{ marginBottom: 12 }}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          Score History
        </Text>
      </Box>

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
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          Current: {latestScore} ({safeHistory.length} days)
        </Text>
      </View>
    </GlassCard>
  );
}