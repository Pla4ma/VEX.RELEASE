import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { triggerHaptic } from '../../../utils/haptics';
import { type } from '../../reference-ui/referenceTokens';
import type { HomeUnlockPathItem } from '../services/home-unlock-path-schemas';

interface ActiveUnlockCardProps {
  progress: number;
  progressLabel: string;
}

        
export function ActiveUnlockCard({
  progress,
  progressLabel,
}: ActiveUnlockCardProps): React.ReactNode {
  return (
    <View
      style={{
        backgroundColor: vexLightGlass.glass.fill,
        borderColor: vexLightGlass.glass.border,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        marginTop: spacing[4],
        padding: spacing[4],
      }}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing[3] }}>
        <View style={{ flex: 1 }}>
          <Text style={[type.kicker, { color: vexLightGlass.text.tertiary }]}>
            SIGNAL PROGRESS
          </Text>
          <Text style={[type.body, { marginTop: spacing[1] }]}>
            Complete one clean session to reveal the baseline layer.
          </Text>
        </View>
        <Icon color={vexLightGlass.semantic.fireDeep} name="arrowRight" size="sm" />
      </View>
      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 6,
          marginTop: spacing[3],
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
      <Text
        style={[
          type.body,
          {
            color: vexLightGlass.semantic.fireDeep,
            fontWeight: '800',
            marginTop: spacing[1],
          },
        ]}
      >
        {progressLabel}
      </Text>
    </View>
  );
}

interface LockedTeaserCardProps {
  item: HomeUnlockPathItem;
  onPeekLocked?: (item: HomeUnlockPathItem) => void;
}

export function LockedTeaserCard({
  item,
  onPeekLocked,
}: LockedTeaserCardProps): React.ReactNode {
  return (
    <Pressable
      accessibilityHint={`Preview ${item.reward}. Finish more sessions to unlock.`}
      accessibilityLabel={`Locked teaser: ${item.title}`}
      accessibilityRole="button"
      onPress={(): void => {
        triggerHaptic('impactLight');
        onPeekLocked?.(item);
      }}
      style={({ pressed }) => ({
        marginTop: spacing[3],
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        style={{
          backgroundColor: vexLightGlass.glass.fillSubtle,
          borderColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          padding: spacing[4],
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing[3] }}>
          <Icon color={vexLightGlass.text.disabled} name="lock" size="sm" />
          <View style={{ flex: 1 }}>
            <Text style={[type.kicker, { color: vexLightGlass.text.tertiary }]}>
              LOCKED TEASER
            </Text>
            <Text style={[type.title, { marginTop: spacing[1] }]}>{item.title}</Text>
            <Text style={[type.body, { marginTop: spacing[1] }]}>{item.body}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
