import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { spacing } from '../../../theme/tokens';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ref, type } from '../../reference-ui/referenceTokens';
import { HomeUnlockMilestones } from './HomeUnlockMilestones';
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
  onPeekLocked,
}: HomeUnlockPathProps): JSX.Element {
  const next = model.nextItem;
  const progress = Math.min(1, next.current / next.requirement);

  return (
    <ReferenceCard accent="fire" glow showAsset={false}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: -8, top: 8, zIndex: 0 }}
      >
        <VexAssetImage name="orangePrism" opacity={0.48} size={118} />
      </View>
      <View style={{ zIndex: 2 }}>
        <Text style={type.kicker}>VEX PATH</Text>
        <Text style={[type.hero, { marginTop: spacing[2], maxWidth: 230 }]}>
          The app opens as it learns you.
        </Text>
        <Text style={[type.body, { marginTop: spacing[2], maxWidth: 236 }]}>
          Day 0 is not empty. It is calibrated. Each finish reveals the next
          layer.
        </Text>
      </View>

      <View style={{ marginTop: spacing[4], zIndex: 2 }}>
        <Text style={type.title}>{next.title}</Text>
        <Text style={[type.body, { marginTop: spacing[1] }]}>
          Unlocks {next.reward}. {model.progressLabel}
        </Text>
        <View
          style={{
            backgroundColor: vexLightGlass.glass.borderSubtle,
            borderRadius: 999,
            height: 6,
            marginTop: spacing[2],
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: vexLightGlass.semantic.fire,
              borderRadius: 999,
              height: '100%',
              width: `${progress * 100}%`,
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: spacing[4], zIndex: 2 }}>
        <HomeUnlockMilestones
          model={model}
          onStartSession={onStartSession}
          onPeekLocked={onPeekLocked}
        />
      </View>

      <View style={{ marginTop: spacing[4], zIndex: 2 }}>
        <LiquidButton
          accessibilityHint="Start a session to unlock the next VEX layer"
          accessibilityLabel="Start session and unlock next VEX path layer"
          label="Start next unlock"
          onPress={onStartSession}
          rightIcon={<Icon color={ref.white} name="arrowRight" size="sm" />}
          size="md"
          variant="fire"
        />
      </View>
    </ReferenceCard>
  );
}
