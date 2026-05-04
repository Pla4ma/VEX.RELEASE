/**
 * Score History Chart Component
 *
 * Visualizes Focus Score trends over time.
 * Handles loading, empty, and error states.
 */

import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { useFocusScoreHistory, useFocusScoreColor } from '../hooks';

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
  const { history, loadingState, error, refresh } = useFocusScoreHistory(userId, days);

  const chartWidth = screenWidth - 48;
  const padding = { top: 20, right: 40, bottom: 30, left: 40 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <Box padding="lg" backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <View style={{ borderRadius: 8, backgroundColor: theme.colors.border.DEFAULT, height }} />
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (loadingState === 'error') {
    return (
      <Box padding="lg" backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <Text variant="body" color="error" style={{ marginBottom: 16 }}>
          Score History
        </Text>
        <Text variant="caption" color="textMuted">
          Failed to load history
        </Text>
      </Box>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================
  if (history.length === 0) {
    return (
      <Box padding="lg" backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <Text variant="body" color="text" style={{ marginBottom: 16 }}>
          Score History
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>📊</Text>
          <Text variant="caption" color="textMuted">
            No score data yet. Complete sessions to build your history!
          </Text>
        </View>
      </Box>
    );
  }

  // ============================================================================
  // CHART RENDERING
  // ============================================================================
  const scores = history.map(h => h.score);
  const minScore = Math.min(...scores, 300);
  const maxScore = Math.max(...scores, 850);
  const scoreRange = maxScore - minScore || 1;

  // Scale functions
  const scaleX = (index: number) =>
    padding.left + (index / (history.length - 1 || 1)) * graphWidth;
  const scaleY = (score: number) =>
    padding.top + graphHeight - ((score - minScore) / scoreRange) * graphHeight;

  // Generate path
  const pathD = history.map((point, i) => {
    const x = scaleX(i);
    const y = scaleY(point.score);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate area path (for gradient fill)
  const areaD = `${pathD} L ${scaleX(history.length - 1)} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;

  // Latest score color
  const latestScore = history[history.length - 1]?.score || 550;
  const scoreColor = latestScore >= 800 ? '#FFD700' :
                     latestScore >= 740 ? '#C0C0C0' :
                     latestScore >= 670 ? '#CD7F32' :
                     latestScore >= 580 ? '#4CAF50' :
                     latestScore >= 500 ? '#8BC34A' :
                     latestScore >= 420 ? '#FFC107' : '#FF9800';

  return (
    <Box padding="lg" backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
      <Text variant="heading3" style={{ marginBottom: 16 }}>Score History</Text>

      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={scoreColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={scoreColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {showGrid && [0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + graphHeight * pct;
          const score = Math.round(maxScore - scoreRange * pct);
          return (
            <React.Fragment key={pct}>
              <Line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#E0E0E0"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={padding.left - 8}
                y={y + 4}
                fontSize={10}
                fill="#666"
                textAnchor="end"
              >
                {score}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Area fill */}
        <Path d={areaD} fill="url(#scoreGradient)" />

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke={scoreColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {history.map((point, i) => {
          const x = scaleX(i);
          const y = scaleY(point.score);
          const isLatest = i === history.length - 1;

          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={isLatest ? 6 : 4}
              fill={isLatest ? scoreColor : '#fff'}
              stroke={scoreColor}
              strokeWidth={isLatest ? 3 : 2}
            />
          );
        })}

        {/* X-axis labels (show first, middle, last dates) */}
        {[0, Math.floor(history.length / 2), history.length - 1].map(i => (
          <SvgText
            key={i}
            x={scaleX(i)}
            y={height - 8}
            fontSize={10}
            fill="#666"
            textAnchor="middle"
          >
            {new Date(history[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </SvgText>
        ))}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: scoreColor }} />
        <Text variant="caption" color="textMuted">
          Current: {latestScore} ({history.length} days)
        </Text>
      </View>
    </Box>
  );
}
