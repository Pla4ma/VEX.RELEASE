import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { getCardWidth } from './session-consequence-types';
import { SessionGlyph } from '../../../shared/ui/liquid-glass/SessionGlyphs';

interface RivalImpactCardProps {
  rivalName: string;
  gapBefore: number;
  gapAfter: number;
  minutesGained: number;
}

export function RivalImpactCard({
  rivalName,
  gapBefore,
  gapAfter,
  minutesGained,
}: RivalImpactCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getCardWidth(screenWidth);

  const gainedGround = gapAfter < gapBefore;
  const nowAhead = gapAfter < 0 && gapBefore >= 0;

  return (
    <View
      style={{
        width: cardWidth,
        padding: theme.spacing[4],
        backgroundColor: gainedGround
          ? `${vexFire.success}15`
          : `${vexFire.danger}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: gainedGround
          ? vexFire.success
          : vexFire.danger,
        marginRight: theme.spacing[3],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[2],
        }}
      >
        <SessionGlyph name={nowAhead ? 'sprint' : 'stake'} size={36} />
        <Text variant="body" fontWeight="700" color={vexFire.cream}>
          {rivalName}
        </Text>
      </View>

      <Text
        variant="body"
        color={vexFire.textSecondary}
        style={{ marginBottom: theme.spacing[2] }}
      >
        {nowAhead
          ? `You overtook ${rivalName}!`
          : gainedGround
            ? `You closed the gap by ${minutesGained} minutes!`
            : `${rivalName} pulled ahead by ${Math.abs(minutesGained)} minutes`}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing[3],
          backgroundColor: vexFire.background,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <View>
          <Text variant="caption" color={vexFire.textMuted}>
            BEFORE
          </Text>
          <Text
            variant="body"
            color={gapBefore <= 0 ? 'success.DEFAULT' : 'error.DEFAULT'}
          >
            {gapBefore === 0
              ? 'Tied'
              : gapBefore < 0
                ? `${Math.abs(gapBefore)} min ahead`
                : `${gapBefore} min behind`}
          </Text>
        </View>
        <Text fontSize={20}>{gainedGround ? '→' : '←'}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption" color={vexFire.textMuted}>
            NOW
          </Text>
          <Text
            variant="body"
            color={gapAfter <= 0 ? 'success.DEFAULT' : 'error.DEFAULT'}
            fontWeight="600"
          >
            {gapAfter === 0
              ? 'Tied'
              : gapAfter < 0
                ? `${Math.abs(gapAfter)} min ahead`
                : `${gapAfter} min behind`}
          </Text>
        </View>
      </View>
    </View>
  );
}
