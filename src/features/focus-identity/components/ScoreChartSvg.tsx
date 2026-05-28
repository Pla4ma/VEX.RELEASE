import React from "react";
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import type { FocusScoreHistoryPoint } from "../types";
import { launchColors } from "@theme/tokens/launch-colors";
import type { ChartPadding } from "./chartHelpers";

interface ScoreChartSvgProps {
  history: FocusScoreHistoryPoint[];
  chartWidth: number;
  height: number;
  graphWidth: number;
  graphHeight: number;
  padding: ChartPadding;
  minScore: number;
  maxScore: number;
  scoreRange: number;
  scoreColor: string;
  scaleX: (i: number) => number;
  scaleY: (s: number) => number;
  pathD: string;
  areaD: string;
  showGrid: boolean;
}

export function ScoreChartSvg({
  history,
  chartWidth,
  height,
  graphHeight,
  padding,
  minScore,
  maxScore,
  scoreRange,
  scoreColor,
  scaleX,
  scaleY,
  pathD,
  areaD,
  showGrid,
}: ScoreChartSvgProps): JSX.Element {
  return (
    <Svg width={chartWidth} height={height}>
      <Defs>
        <LinearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={scoreColor} stopOpacity="0.3" />
          <Stop offset="1" stopColor={scoreColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>

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

      <Path d={areaD} fill="url(#scoreGradient)" />

      <Path
        d={pathD}
        fill="none"
        stroke={scoreColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {history.map((point: FocusScoreHistoryPoint, i: number) => {
        const x = scaleX(i);
        const y = scaleY(point.score);
        const isLatest = i === history.length - 1;
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

      {[0, Math.floor(history.length / 2), history.length - 1].map(
        (i) => (
          <SvgText
            key={i}
            x={scaleX(i)}
            y={height - 8}
            fontSize={10}
            fill={launchColors.hex_666}
            textAnchor="middle"
          >
            {new Date(history[i]!.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </SvgText>
        ),
      )}
    </Svg>
  );
}
