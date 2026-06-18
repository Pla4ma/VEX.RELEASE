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
          ? `${theme.colors.success[500]}15`
          : `${theme.colors.error[500]}15`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 2,
        borderColor: gainedGround
          ? theme.colors.success[500]
          : theme.colors.error[500],
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
        <Text variant="body" fontWeight="700" color="text.primary">
          {rivalName}
        </Text>
      </View>

      <Text
        variant="body"
        color="text.secondary"
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
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <View>
          <Text variant="caption" color="text.tertiary">
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
          <Text variant="caption" color="text.tertiary">
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
