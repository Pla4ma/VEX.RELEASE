import React from 'react';

import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/primitives/Text';
import { vexFire } from '../../theme/tokens/vex-fire';

export type BossIntensity = 'subtle' | 'game-like' | 'intense';

const BOSS_COPY: Record<string, { title: string; description: string }> = {
  subtle: {
    title: 'Focus Momentum',
    description:
      'Each session you complete adds to your momentum. A quiet marker tracks the focus you have already earned.',
  },
  'game-like': {
    title: 'Boss Battle',
    description:
      'Your focus sessions push the creature back, one block at a time. Every minute focused counts as damage.',
  },
  intense: {
    title: 'Boss Battle — Full Assault',
    description:
      'Every session hits harder. Longer sessions deal critical damage. Your streak multiplies everything. Press the attack.',
  },
};

export function getBossCopy(bossIntensity: string): {
  title: string;
  description: string;
} {
  return BOSS_COPY[bossIntensity] ?? BOSS_COPY.subtle!;
}

export function toScreenIntensity(intensity: string): BossIntensity {
  if (
    intensity === 'game-like' ||
    intensity === 'intense' ||
    intensity === 'subtle'
  )
    {return intensity;}
  return 'subtle';
}

export const nextResetLabel = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const days = (8 - day) % 7 || 7;
  const diff =
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + days,
      0,
      0,
      0,
    ) - Date.now();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  return `${d}d ${h}h`;
};

export const BossFallback: React.ComponentType<{
  intensity: string;
  onStartSession: () => void;
  unlockReason: string;
  stage: string;
  resetLabel: string;
}> = ({ intensity, onStartSession, unlockReason, stage, resetLabel }) => {
  const copy = getBossCopy(intensity);
  const isSubtle = intensity === 'subtle';
  return (
    <View style={{ backgroundColor: vexFire.background, flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: 18, padding: 24 }}>
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../../assets/vex/utility/challenge-badge.png')}
          resizeMode="contain"
          style={{ alignSelf: 'center', height: 180, width: 180 }}
        />
        <Text variant="label" color={vexFire.amber}>Momentum encounter</Text>
        <Text variant="h1" color={vexFire.cream}>{copy.title}</Text>
        <Text variant="body" color={vexFire.textSecondary}>{copy.description}</Text>
        <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.border, borderRadius: 18, borderWidth: 1, gap: 8, padding: 18 }}>
          <Text variant="caption" color={vexFire.textMuted}>Unlock signal</Text>
          <Text variant="body" color={vexFire.cream}>{unlockReason}</Text>
          <Text variant="caption" color={vexFire.textSecondary}>{`Next reset in ${resetLabel} · ${stage}`}</Text>
        </View>
        <Pressable
          accessibilityHint="Starts a focus session to build momentum."
          accessibilityLabel="Start a focus session"
          accessibilityRole="button"
          onPress={onStartSession}
          style={{ alignItems: 'center', backgroundColor: vexFire.ember, borderRadius: 16, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18 }}
        >
          <Text variant="label" color={vexFire.background}>Start a focus session</Text>
        </Pressable>
        <Text variant="caption" color={vexFire.textMuted}>{isSubtle ? 'Quiet progress, visible proof.' : 'Every minute focused counts.'}</Text>
      </ScrollView>
    </View>
  );
};
