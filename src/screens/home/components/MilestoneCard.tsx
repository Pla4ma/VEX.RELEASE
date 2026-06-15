import React from 'react';
import { Pressable, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing, borderRadius } from '../../../theme/tokens/spacing';
import { triggerHaptic } from '../../../utils/haptics';
import type { HomeUnlockPathItem } from '../services/home-unlock-path-schemas';
import { MilestoneNode, type MilestoneState } from './MilestoneNode';
import { MilestoneProgress } from './MilestoneProgress';

function stateFor(item: HomeUnlockPathItem, isNext: boolean): MilestoneState {
  if (item.isUnlocked) return 'unlocked';
  if (isNext) return 'current';
  return 'locked';
}

export function MilestoneCard({
  item,
  isNext,
  onPress,
}: {
  item: HomeUnlockPathItem;
  isNext: boolean;
  onPress?: () => void;
}): React.ReactNode {
  const state = stateFor(item, isNext);
  const variant = state === 'unlocked' ? 'success' : state === 'current' ? 'warning' : 'subtle';
  const badgeText = state === 'unlocked' ? 'OPEN' : state === 'current' ? 'NEXT' : 'LOCKED';
  const badgeColor =
    state === 'unlocked'
      ? vexLightGlass.mint[700]
      : state === 'current'
        ? vexLightGlass.semantic.fireDeep
        : vexLightGlass.text.disabled;

  const content = (
    <GlassCard variant={variant} padding={14} radius={borderRadius.lg}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: spacing[1],
        }}
      >
        <Text
          style={{
            color: vexLightGlass.mint[800],
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 1.5,
          }}
        >
          {item.eyebrow}
        </Text>
        <View
          style={{
            backgroundColor: vexLightGlass.glass.fillSubtle,
            borderColor: vexLightGlass.glass.border,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            paddingHorizontal: spacing[2],
            paddingVertical: 2,
          }}
        >
          <Text
            style={{ color: badgeColor, fontSize: 12, fontWeight: '900' }}
          >
            {badgeText}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 16,
          fontWeight: '800',
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          lineHeight: 17,
          marginTop: spacing[1],
        }}
      >
        {item.body}
      </Text>
      <MilestoneProgress item={item} state={state} />
    </GlassCard>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityHint={
        state === 'locked'
          ? `Peek ${item.reward}. Finish more sessions to unlock.`
          : `Start a session to unlock ${item.reward}`
      }
      accessibilityLabel={item.title}
      accessibilityRole="button"
      onPress={(): void => {
        triggerHaptic('impactLight');
        onPress();
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {content}
    </Pressable>
  );
}
