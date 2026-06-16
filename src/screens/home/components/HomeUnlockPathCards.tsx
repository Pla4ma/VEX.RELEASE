import React from 'react';
import { Pressable, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius, spacing } from '../../../theme/tokens/radius';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { triggerHaptic } from '../../../utils/haptics';
import { type } from '../../reference-ui/referenceTokens';
import type { HomeUnlockPathItem } from '../services/home-unlock-path-schemas';

interface ActiveUnlockCardProps {
  item: HomeUnlockPathItem;
  progress: number;
  progressLabel: string;
  actionCopy: string;
}

        const elementStyle_29 = {
  alignItems: 'center',
  backgroundColor: vexLightGlass.background.atmosphericFire,
  borderColor: vexLightGlass.glass.border,
  borderRadius: borderRadius.full,
  borderWidth: 1,
  height: 44,
  justifyContent: 'center',
  width: 44,
};
export function ActiveUnlockCard({
  item,
  progress,
  progressLabel,
  actionCopy,
}: ActiveUnlockCardProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={borderRadius['2xl']} variant="warning">
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing[3] }}>
        <View
          style={elementStyle_29}
        >
          <Icon color={vexLightGlass.semantic.fireDeep} name="lock" size="sm" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type.kicker, { color: vexLightGlass.semantic.fireDeep }]}>
            {item.eyebrow}
          </Text>
          <Text style={[type.title, { marginTop: spacing[1] }]}>{item.title}</Text>
        </View>
        <View
          style={{
            backgroundColor: vexLightGlass.glass.fillStrong,
            borderColor: vexLightGlass.glass.border,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[1],
          }}
        >
          <Text style={[type.kicker, { color: vexLightGlass.semantic.fireDeep }]}>
            NEXT
          </Text>
        </View>
      </View>
      <Text style={[type.body, { marginTop: spacing[3] }]}>
        {item.body} {actionCopy}
      </Text>
      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 7,
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
    </GlassCard>
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
      <GlassCard padding={14} radius={borderRadius.xl} variant="subtle">
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
      </GlassCard>
    </Pressable>
  );
}
