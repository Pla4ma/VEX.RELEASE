import React from 'react';
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import type { SquadSummary } from '../schemas';
import { launchColors } from '@theme/tokens/launch-colors';


type WeeklyStats = {
  totalSessions: number;
  totalFocusMinutes: number;
  activeMemberCount: number;
};

type SquadShareCardProps = {
  squad: SquadSummary;
  weeklyStats: WeeklyStats;
};

export const SQUAD_SHARE_CARD_WIDTH = 390;
export const SQUAD_SHARE_CARD_HEIGHT = 260;

function getSquadHue(squadId: string): number {
  const parsed = Number.parseInt(squadId.slice(0, 6), 16);
  return Number.isNaN(parsed) ? 220 : parsed % 360;
}

export function SquadShareCard({
  squad,
  weeklyStats,
}: SquadShareCardProps): JSX.Element {
  const hue = getSquadHue(squad.id);
  const squadCode = squad.id.slice(0, 8);
  const emblemLetter = squad.name.trim().charAt(0).toUpperCase() || 'S';
  const totalHours = Math.round(weeklyStats.totalFocusMinutes / 60);
  const accent = `hsl(${hue}, 72%, 56%)`;
  const softAccent = `hsla(${hue}, 72%, 56%, 0.18)`;

  return (
    <Svg
      width={SQUAD_SHARE_CARD_WIDTH}
      height={SQUAD_SHARE_CARD_HEIGHT}
      viewBox={`0 0 ${SQUAD_SHARE_CARD_WIDTH} ${SQUAD_SHARE_CARD_HEIGHT}`}
    >
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={launchColors.hex_0d1117} />
          <Stop offset="1" stopColor={launchColors.hex_1a1a2e} />
        </LinearGradient>
      </Defs>

      <Rect
        width={SQUAD_SHARE_CARD_WIDTH}
        height={SQUAD_SHARE_CARD_HEIGHT}
        rx={28}
        fill="url(#bg)"
      />
      <Circle cx={328} cy={48} r={72} fill={softAccent} />
      <Circle cx={58} cy={60} r={32} fill={accent} />
      <SvgText
        x={58}
        y={70}
        fill={launchColors.hex_ffffff}
        fontSize={28}
        fontWeight="700"
        textAnchor="middle"
      >
        {emblemLetter}
      </SvgText>

      <SvgText x={104} y={70} fill={launchColors.hex_ffffff} fontSize={28} fontWeight="700">
        {squad.name}
      </SvgText>

      <SvgText x={32} y={126} fill={launchColors.hex_f3f4f6} fontSize={18} fontWeight="600">
        {`⚡ ${weeklyStats.totalSessions} sessions this week`}
      </SvgText>
      <SvgText x={32} y={160} fill={launchColors.hex_f3f4f6} fontSize={18} fontWeight="600">
        {`⏱️ ${totalHours} total focus hours`}
      </SvgText>
      <SvgText x={32} y={194} fill={launchColors.hex_f3f4f6} fontSize={18} fontWeight="600">
        {`🔥 ${weeklyStats.activeMemberCount} members active`}
      </SvgText>

      <Line
        x1={24}
        y1={224}
        x2={SQUAD_SHARE_CARD_WIDTH - 24}
        y2={224}
        stroke={launchColors.hex_ffffff20}
        strokeWidth={1}
      />
      <SvgText x={24} y={243} fill={launchColors.hex_9ca3af} fontSize={11}>
        {`Join: vex.app/squad/${squadCode}`}
      </SvgText>
      <SvgText
        x={SQUAD_SHARE_CARD_WIDTH - 24}
        y={243}
        fill={launchColors.hex_e5e7eb}
        fontSize={12}
        fontWeight="700"
        textAnchor="end"
      >
        VEX
      </SvgText>
    </Svg>
  );
}
