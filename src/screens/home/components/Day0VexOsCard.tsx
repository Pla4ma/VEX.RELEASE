import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ref, type } from '../../reference-ui/referenceTokens';

interface Day0VexOsCardProps {
  completedActions: number;
  onStartSession: () => void;
}

export function Day0VexOsCard({
  completedActions,
  onStartSession,
}: Day0VexOsCardProps): React.ReactNode {
  const osPercent = Math.min(19, 5 + completedActions * 7);
  return (
    <View style={{ gap: spacing[4], marginBottom: spacing[5] }}>
      <View style={{ gap: spacing[2] }}>
        <Text style={type.kicker}>DAILY FOCUS</Text>
        <Text
          style={[
            type.hero,
            {
              fontFamily: 'Urbanist_900Black',
              fontSize: 42,
              letterSpacing: 0,
              lineHeight: 48,
            },
          ]}
        >
          One clean block. Then VEX shapes next.
        </Text>
        <Text style={[type.body, { maxWidth: 286 }]}>
          Start focused work without opening a dashboard maze.
        </Text>
      </View>

      <Text
        style={[
          type.body,
          {
            color: vexLightGlass.mint[800],
            fontFamily: 'Urbanist_800ExtraBold',
          },
        ]}
      >
        Adaptive / {osPercent}% online / first contract
      </Text>

      <View style={{ gap: spacing[2] }}>
        <Text
          style={[
            type.title,
            {
              fontFamily: 'Urbanist_800ExtraBold',
              letterSpacing: 0,
            },
          ]}
        >
          30 minutes, one start.
        </Text>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing[3],
          }}
        >
          <LiquidButton
            accessibilityHint="Starts your first focus session"
            accessibilityLabel="Start first focus block"
            label="Start block"
            onPress={onStartSession}
            rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
            size="sm"
            variant="primary"
          />
          <Text
            style={[
              type.body,
              {
                color: vexLightGlass.text.tertiary,
                fontFamily: 'Urbanist_700Bold',
              },
            ]}
          >
            ~30 min
          </Text>
        </View>
      </View>
    </View>
  );
}
