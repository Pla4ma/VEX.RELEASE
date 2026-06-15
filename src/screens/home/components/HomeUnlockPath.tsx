import React from 'react';
import { View } from 'react-native';

import { LiquidButton } from '../../../components/glass/LiquidButton';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { spacing } from '../../../theme/tokens/spacing';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { ref, type } from '../../reference-ui/referenceTokens';
import type {
  HomeUnlockPathItem,
  HomeUnlockPathModel,
} from '../services/home-unlock-path-schemas';
import { ActiveUnlockCard, LockedTeaserCard } from './HomeUnlockPathCards';

interface HomeUnlockPathProps {
  model: HomeUnlockPathModel;
  onStartSession: () => void;
  onPeekLocked?: (item: HomeUnlockPathItem) => void;
}

export function HomeUnlockPath({
  model,
  onStartSession,
  onPeekLocked,
}: HomeUnlockPathProps): React.ReactNode {
  const next = model.nextItem;
  const teaser = model.previewItems.find(
    (item) => item.eyebrow !== next.eyebrow,
  );
  const progress = Math.min(1, next.current / next.requirement);
  const remaining = Math.max(0, next.requirement - next.current);
  const actionCopy =
    remaining === 1
      ? 'Finish 1 session to unlock it.'
      : `Finish ${remaining} sessions to unlock it.`;

  return (
    <ReferenceCard accent="fire" glow showAsset={false}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: -10, top: -2, zIndex: 0 }}
      >
        <VexAssetImage name="orangePrism" opacity={0.4} size={104} />
      </View>
      <View style={{ zIndex: 2 }}>
        <Text style={type.kicker}>VEX ROADMAP</Text>
        <Text style={[type.hero, { marginTop: spacing[2], maxWidth: 238 }]}>
          Your next layer is close.
        </Text>
        <Text style={[type.body, { marginTop: spacing[2], maxWidth: 236 }]}>
          VEX only reveals features when your sessions give it enough signal.
        </Text>
      </View>

      <ActiveUnlockCard
        item={next}
        progress={progress}
        progressLabel={model.progressLabel}
        actionCopy={actionCopy}
      />

      {teaser ? <LockedTeaserCard item={teaser} onPeekLocked={onPeekLocked} /> : null}

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
