import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ref, type } from '../../reference-ui/referenceTokens';
import type {
  HomeUnlockPathItem,
  HomeUnlockPathModel,
} from '../services/home-unlock-path-schemas';

interface HomeUnlockPathProps {
  model: HomeUnlockPathModel;
  onStartSession: () => void;
  onPeekLocked?: (item: HomeUnlockPathItem) => void;
}

export function HomeUnlockPath({
  model,
  onStartSession,
}: HomeUnlockPathProps): React.ReactNode {
  const next = model.nextItem;
  const progress = Math.min(1, next.current / next.requirement);
  const remaining = Math.max(0, next.requirement - next.current);
  const actionCopy =
    remaining === 1
      ? '1 session left'
      : `${remaining} sessions left`;

  return (
    <ReferenceCard accent="mint" showAsset={false} style={{ marginBottom: spacing[8] }}>
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: vexLightGlass.mint[100],
            borderRadius: borderRadius.xl,
            height: 54,
            justifyContent: 'center',
            width: 54,
          }}
        >
          <Icon color={vexLightGlass.mint[800]} name="lock" size="sm" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.kicker}>NEXT UNLOCK</Text>
          <Text style={[type.title, { marginTop: spacing[1] }]}>
            {next.title}
          </Text>
          <Text style={[type.body, { marginTop: spacing[1] }]}>
            {actionCopy} · {model.progressLabel}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 6,
          marginTop: spacing[4],
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: vexLightGlass.semantic.fire,
            borderRadius: borderRadius.full,
            height: '100%',
            width: `${progress * 100}%`,
          }}
        />
      </View>

      <View style={{ marginTop: spacing[4] }}>
        <LiquidButton
          accessibilityHint="Start a session to unlock the next VEX layer"
          accessibilityLabel="Start session and unlock next VEX path layer"
          fullWidth
          label="Start focus session"
          onPress={onStartSession}
          rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
          size="sm"
          variant="fire"
        />
      </View>
    </ReferenceCard>
  );
}

