import React from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Text } from "../../../components/primitives/Text";
import { Box } from "../../../components/primitives/Box";
import { useTheme } from "../../../theme";
import { useFocusScoreHistory } from "../hooks-focus-score";
import type { FocusScoreHistoryPoint } from "../types";
import { launchColors } from "@theme/tokens/launch-colors";
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
  if (status === "pending") {
    return (
      <Box
        padding="lg"
        backgroundColor="surface"
        borderRadius="lg"
        style={{ width: "100%" }}
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
  if (status === "error") {
    return (
      <Box
        padding="lg"
        backgroundColor="surface"
        borderRadius="lg"
        style={{ width: "100%" }}
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
        style={{ width: "100%" }}
      >
        <Text
          variant="body"
          color="text"
          style={{ marginBottom: theme.spacing[4] }}
        >
          Score History
        </Text>
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
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
  const scores = safeHistory.map((h: FocusScoreHistoryPoint) => h.score);
  const minScore = Math.min(...scores, 300);
  const maxScore = Math.max(...scores, 850);
  const scoreRange = maxScore - minScore || 1;
  const scaleX = (index: number): number =>
    padding.left + (index / (safeHistory.length - 1 || 1)) * graphWidth;
  const scaleY = (score: number): number =>
    padding.top + graphHeight - ((score - minScore) / scoreRange) * graphHeight;
  const pathD = safeHistory
    .map((point: FocusScoreHistoryPoint, i: number) => {
      const x = scaleX(i);
      const y = scaleY(point.score);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const areaD = `${pathD} L ${scaleX(safeHistory.length - 1)} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;
  const latestScore = safeHistory[safeHistory.length - 1]?.score || 550;
  const scoreColor =
    latestScore >= 800
      ? launchColors.hex_ffd700
      : latestScore >= 740
        ? launchColors.hex_c0c0c0
        : latestScore >= 670
          ? launchColors.hex_cd7f32
          : latestScore >= 580
            ? launchColors.hex_4caf50
            : latestScore >= 500
              ? launchColors.hex_8bc34a
              : latestScore >= 420
                ? launchColors.hex_ffc107
                : launchColors.hex_ff9800;
  return (
    <Box
      padding="lg"
      backgroundColor="surface"
      borderRadius="lg"
      style={{ width: "100%" }}
    >
      <Text variant="heading3" style={{ marginBottom: theme.spacing[4] }}>
        Score History
      </Text>

      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={scoreColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={scoreColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {}
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + graphHeight * pct;
            const score = Math.round(maxScore - scoreRange * pct);
            return (
              <React.Fragment key={pct}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={launchColors.hex_e0e0e0}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize={10}
                  fill={launchColors.hex_666}
                  textAnchor="end"
                >
                  {score}
                </SvgText>
              </React.Fragment>
            );
          })}

        {}
        <Path d={areaD} fill="url(#scoreGradient)" />

        {}
        <Path
          d={pathD}
          fill="none"
          stroke={scoreColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {}
        {safeHistory.map((point: FocusScoreHistoryPoint, i: number) => {
          const x = scaleX(i);
          const y = scaleY(point.score);
          const isLatest = i === safeHistory.length - 1;
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={isLatest ? 6 : 4}
              fill={isLatest ? scoreColor : launchColors.hex_fff}
              stroke={scoreColor}
              strokeWidth={isLatest ? 3 : 2}
            />
          );
        })}

        {}
        {[0, Math.floor(safeHistory.length / 2), safeHistory.length - 1].map(
          (i) => (
            <SvgText
              key={i}
              x={scaleX(i)}
              y={height - 8}
              fontSize={10}
              fill={launchColors.hex_666}
              textAnchor="middle"
            >
              {new Date(safeHistory[i]!.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </SvgText>
          ),
        )}
      </Svg>

      {}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
