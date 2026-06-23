import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
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
    <ReferenceCard accent="mint" showAsset={false} style={{ marginBottom: spacing[4] }}>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.82,
          position: 'absolute',
          right: -8,
          top: 18,
          zIndex: 0,
        }}
      >
        <VexAssetImage name="sculpture" size={138} />
      </View>

      <View style={{ maxWidth: 236, zIndex: 2 }}>
        <Text style={type.kicker}>DAILY FOCUS</Text>
        <Text style={[type.hero, { marginTop: spacing[2] }]}>
          Your first block is waiting.
        </Text>
        <Text style={[type.body, { marginTop: spacing[2] }]}>
          Start with one clean contract. VEX saves the signal and shapes the next move.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
        <View
          style={{
            backgroundColor: vexLightGlass.mint[100],
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[1],
          }}
        >
          <Text style={[type.kicker, { letterSpacing: 0.5 }]}>Adaptive</Text>
        </View>
        <View
          style={{
            backgroundColor: vexLightGlass.glass.fillStrong,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[1],
          }}
        >
          <Text style={[type.kicker, { letterSpacing: 0.5 }]}>
            {osPercent}% online
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: vexLightGlass.glass.fillStrong,
          borderColor: vexLightGlass.glass.border,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          marginTop: spacing[4],
          padding: spacing[4],
          zIndex: 2,
        }}
      >
        <Text style={[type.kicker, { color: vexLightGlass.text.tertiary }]}>
          FIRST CONTRACT
        </Text>
        <Text style={[type.title, { marginTop: spacing[2] }]}>
          30 minutes, one clean start.
        </Text>
        <Text style={[type.body, { marginTop: spacing[1] }]}>
          Deep work window. No dashboard. No setup loop.
        </Text>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing[3],
            marginTop: spacing[3],
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
              { color: vexLightGlass.text.tertiary, fontWeight: '700' },
            ]}
          >
            ~30 min
          </Text>
        </View>
      </View>
    </ReferenceCard>
  );
}

